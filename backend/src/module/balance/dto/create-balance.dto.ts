import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsDateString,
} from 'class-validator';
import { EnergyType, EnergySubtype } from '../entities/energy.enums';
import { IsValidEnergyPair } from './decorators/energy-pair.decorator';
import { Transform, Type } from 'class-transformer';
import { CleanOptional } from 'src/core/decorators/optional.decorators';
import {
  transformToEnergyType,
  transformToEnergySubtype,
} from '../transformers/energy.transformers';

export class CreateBalanceDto {
  @Transform(transformToEnergyType)
  @IsEnum(EnergyType, { message: 'Invalid energy type' })
  @IsNotEmpty()
  type: EnergyType;

  @Transform(transformToEnergySubtype)
  @IsEnum(EnergySubtype, {
    message: `Invalid energy subtype`,
  })
  @IsNotEmpty()
  @IsValidEnergyPair('type', {
    message: 'Energy type and subtype are not compatible',
  })
  subtype: EnergySubtype;

  @Type(() => Number)
  @IsNumber({}, { message: 'Value must be a valid number' })
  @IsNotEmpty()
  value: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Value must be a valid number' })
  @IsPositive({ message: 'Percentage must be a positive number' })
  percentage: number;

  @CleanOptional()
  @IsString()
  description?: string;

  @IsDateString({}, { message: 'Date must be a valid ISO 8601 date string' })
  @IsNotEmpty()
  date: string;
}
