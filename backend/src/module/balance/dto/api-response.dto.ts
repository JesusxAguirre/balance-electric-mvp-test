import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';

/**
 * DTO for individual value entries in the API response
 */
export class ApiValueDto {
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsNumber()
  @IsNotEmpty()
  percentage: number;

  @IsDateString()
  @IsNotEmpty()
  datetime: string;
}

/**
 * DTO for attributes in the API response
 */
export class ApiAttributesDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiValueDto)
  values: ApiValueDto[];
}

/**
 * DTO for attributes of included items
 */
export class ApiIncludedAttributesDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiContentDto)
  content: ApiContentDto[];
}

/**
 * DTO for content items in the API response
 */
export class ApiContentDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ValidateNested()
  @Type(() => ApiAttributesDto)
  attributes: ApiAttributesDto;
}

/**
 * DTO for included items in the API response
 */
export class ApiIncludedDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @ValidateNested()
  @Type(() => ApiIncludedAttributesDto)
  attributes: ApiIncludedAttributesDto;
}

/**
 * DTO for the complete API response
 */
export class ElectricBalanceApiResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiIncludedDto)
  included: ApiIncludedDto[];
}
