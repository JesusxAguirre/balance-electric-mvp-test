import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { BalanceRepository } from './balance.repository';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import axios, { all } from 'axios';
import { env } from 'src/config/env';
import { ElectricBalanceApiResponseDto } from './dto/api-response.dto';

@Injectable()
export class BalanceService {
  constructor(
    @Inject(BalanceRepository)
    private readonly balanceRepository: BalanceRepository,
  ) {}

  async refreshData(startDate: string, endDate: string) {
    try {
      // Fetch data from external API
      const response = await axios.get(
        `${env.API_URL}?start_date=${startDate}&end_date=${endDate}&time_trunc=day`,
        {
          responseType: 'json',
        },
      );

      // Validate API response structure
      const apiResponse = plainToInstance(
        ElectricBalanceApiResponseDto,
        response.data,
      );
      const apiValidationErrors = await validate(apiResponse);

      if (apiValidationErrors.length > 0) {
        throw new BadRequestException({
          message: 'Invalid API response structure',
          errors: this.formatValidationErrors(apiValidationErrors),
        });
      }

      // Parse nested structure and flatten to balance entries
      const balances: any[] = [];

      for (const included of apiResponse.included) {
        const groupType = included.type; // e.g., "Renovable"

        for (const content of included.attributes.content) {
          const subtype = content.type; // e.g., "Hidráulica"
          const description = content.attributes.description;

          // Each value entry becomes a separate balance record
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

      // Transform and validate DTOs (transformers will convert Spanish names to enums)
      const instances = plainToInstance(CreateBalanceDto, balances, {
        enableImplicitConversion: true,
      });

      // Validate each instance
      const allValidationErrors: ValidationError[] = [];
      for (let i = 0; i < instances.length; i++) {
        const errors = await validate(instances[i], {
          whitelist: true,
          forbidNonWhitelisted: true,
        });
        if (errors.length > 0) {
          allValidationErrors.push(
            ...errors.map((err) => {
              err.property = `[${i}].${err.property}`;
              return err;
            }),
          );
        }
      }

      if (allValidationErrors.length > 0) {
        throw new BadRequestException({
          message: this.formatValidationErrors(allValidationErrors),
        });
      }

      const entities = instances.map((dto) =>
        this.balanceRepository.create(dto),
      );
      await this.balanceRepository.save(entities);

      return {
        message: 'Balances saved successfully',
        count: entities.length,
        dateRange: { startDate, endDate },
      };
    } catch (error) {
      // Re-throw BadRequestException with validation errors
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Handle axios errors
      if (axios.isAxiosError(error)) {
        console.log('go here');
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

      // Handle database errors
      if (error.code === '23505') {
        // PostgreSQL unique violation
        throw new HttpException(
          {
            message: 'Duplicate balance entries detected',
            details:
              'Some balance records already exist for the given date range',
          },
          HttpStatus.CONFLICT,
        );
      }

      // Generic error handler
      throw new HttpException(
        {
          message: 'Error processing balance data',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Format validation errors into a readable structure
   */
  private formatValidationErrors(errors: ValidationError[]): any[] {
    return errors.map((error) => ({
      property: error.property,
      value: error.value,
      constraints: error.constraints,
      children: error.children?.length
        ? this.formatValidationErrors(error.children)
        : undefined,
    }));
  }

  findAll() {
    return this.balanceRepository.find();
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
