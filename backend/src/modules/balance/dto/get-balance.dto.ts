import { IsEnum, IsISO8601, IsNotEmpty, IsOptional } from 'class-validator';
import { EnergySubtype, EnergyType } from '../entities/energy.enums';
import { IsValidEnergyPair } from './decorators/energy-pair.decorator';

export enum DataFilterBy {
  YEAR = 'year',
  MONTH = 'month',
}

export class QueryFilterDto {
  @IsISO8601({}, { message: 'start_date must be a valid ISO8601 date string' })
  @IsNotEmpty()
  start_date: string;

  @IsISO8601({}, { message: 'end_date must be a valid ISO8601 date string' })
  @IsNotEmpty()
  end_date: string;

  @IsOptional()
  @IsEnum(EnergyType, { message: 'Invalid energy type' })
  type?: EnergyType;

  @IsOptional()
  @IsEnum(EnergySubtype, {
    message: `Invalid energy subtype`,
  })
  @IsValidEnergyPair('type', {
    message: 'Energy type and subtype are not compatible',
  })
  subtype?: EnergySubtype;

  @IsOptional()
  @IsEnum(DataFilterBy, {
    message: 'Invalid time_grouping value. Must be "year" or "month".',
  })
  time_grouping?: DataFilterBy;
}
