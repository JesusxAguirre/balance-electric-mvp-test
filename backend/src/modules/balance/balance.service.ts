import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { BalanceRepository } from './balance.repository';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import axios from 'axios';
import { env } from 'src/config/env';
import { ElectricBalanceApiResponseDto } from './dto/api-response.dto';
import { formatValidationErrors } from 'src/utils/utils';
import { Balance } from './entities/balance.entity';
import { DataFilterBy, QueryFilterDto } from './dto/get-balance.dto';
import { time } from 'console';

@Injectable()
export class BalanceService {
  constructor(
    @Inject(BalanceRepository)
    private readonly balanceRepository: BalanceRepository,
  ) {}

  async refreshData(startDate: string, endDate: string) {
    try {
      const apiResponse = await this._fetchAndValidateApiData(
        startDate,
        endDate,
      );
      const balanceDtos = await this._transformAndValidateData(apiResponse);
      const savedEntities = await this._saveBalances(balanceDtos);

      return {
        message: 'Balances saved successfully',
        count: savedEntities.length,
        dateRange: { startDate, endDate },
      };
    } catch (error) {
      this._handleRefreshError(error);
    }
  }

  private async _fetchAndValidateApiData(
    startDate: string,
    endDate: string,
  ): Promise<ElectricBalanceApiResponseDto> {
    const response = await axios.get(
      `${env.API_URL}?start_date=${startDate}&end_date=${endDate}&time_trunc=day`,
      {
        responseType: 'json',
      },
    );

    const apiResponse = plainToInstance(
      ElectricBalanceApiResponseDto,
      response.data,
    );
    const errors = await validate(apiResponse);

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Invalid API response structure',
        errors: formatValidationErrors(errors),
      });
    }

    return apiResponse;
  }

  private async _transformAndValidateData(
    apiResponse: ElectricBalanceApiResponseDto,
  ): Promise<CreateBalanceDto[]> {
    const balances: any[] = [];

    for (const included of apiResponse.included) {
      const groupType = included.type;
      for (const content of included.attributes.content) {
        const subtype = content.type;
        const description = content.attributes.description;
        for (const valueEntry of content.attributes.values) {
          balances.push({
            type: groupType,
            subtype: subtype,
            value: valueEntry.value,
            percentage: valueEntry.percentage,
            description: description,
            date: valueEntry.datetime,
          });
        }
      }
    }

    const instances = plainToInstance(CreateBalanceDto, balances, {
      enableImplicitConversion: true,
    });

    const validationErrors: ValidationError[] = [];
    for (const instance of instances) {
      const errors = await validate(instance, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      if (errors.length > 0) {
        validationErrors.push(...errors);
      }
    }

    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed for one or more balance entries',
        errors: formatValidationErrors(validationErrors),
      });
    }

    return instances;
  }

  private async _saveBalances(
    balanceDtos: CreateBalanceDto[],
  ): Promise<Balance[]> {
    const entities = balanceDtos.map((dto) =>
      this.balanceRepository.create(dto),
    );
    return this.balanceRepository.save(entities);
  }

  private _handleRefreshError(error: any) {
    if (error instanceof BadRequestException) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      console.log(error);
      throw new HttpException(
        {
          message: 'Failed to fetch data from REE Api please try later',
          details: error.message,
          statusCode: error.response?.status,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (error.code === '23505') {
      throw new HttpException(
        {
          message: 'Duplicate balance entries detected',
          details:
            'Some balance records already exist for the given date range',
        },
        HttpStatus.CONFLICT,
      );
    }

    throw new HttpException(
      {
        message: 'Error processing balance data',
        details: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  // NEW REUSABLE DATA FETCHING METHOD
  async findAll(query: QueryFilterDto) {
    const { start_date, end_date, type, subtype, time_grouping } = query;

    const qb = this.balanceRepository.createQueryBuilder('balance');

    qb.where('balance.date BETWEEN :start_date AND :end_date', {
      start_date: start_date,
      end_date: end_date,
    });

    if (type) {
      qb.andWhere('balance.type = :type', { type });
    }

    if (subtype) {
      qb.andWhere('balance.sub_type = :subtype', { subtype });
    }

    if (!time_grouping) {
      qb.orderBy('balance.date', 'ASC');
      return qb.getMany();
    }

    const selectColumns: string[] = ['SUM(balance.value) AS "totalValue"'];
    const groupByColumns: string[] = [];

    if (type) {
      selectColumns.push('balance.type AS "type"');
      groupByColumns.push('balance.type');
    }

    if (subtype) {
      selectColumns.push('balance.sub_type AS "subtype"');
      groupByColumns.push('balance.sub_type');
    }

    // Group by Time (Year/Month)
    if (time_grouping) {
      const datePart =
        time_grouping === DataFilterBy.YEAR
          ? 'EXTRACT(YEAR FROM balance.date)'
          : "TO_CHAR(balance.date, 'YYYY-MM')"; // Use YYYY-MM for proper month grouping/sorting

      selectColumns.push(`${datePart} AS "timeGroup"`);
      groupByColumns.push(`"timeGroup"`);
      qb.orderBy(`"timeGroup"`, 'ASC'); // Order by time group
    }

    // Select and Group
    qb.select(selectColumns);
    qb.groupBy(groupByColumns.join(', '));

    return qb.getRawMany(); // Returns raw aggregated objects
  }

  async findOne(id: string) {
    const balance = await this.balanceRepository.findOne({ where: { id } });

    if (!balance) {
      throw new NotFoundException(
        `Balance electrico con id -> ${id} no encontrado`,
      );
    }

    return balance;
  }

  async remove(id: string) {
    const balance = await this.findOne(id);

    this.balanceRepository.remove(balance);

    return {
      message: 'Electric balancer remove suffefuly',
      balance,
    };
  }
}
