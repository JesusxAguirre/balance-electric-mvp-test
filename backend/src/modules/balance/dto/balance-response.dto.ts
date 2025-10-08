import { Expose, Transform } from 'class-transformer';
import { EnergyType, EnergySubtype } from '../entities/energy.enums';
import {
  transformEnergyTypeToDisplayName,
  transformEnergySubtypeToDisplayName,
} from '../transformers/energy.transformers';

/**
 * Response DTO for Balance entity
 * Transforms enum values to Spanish display names for client consumption
 */
export class BalanceResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: EnergyType;

  @Expose()
  @Transform(transformEnergyTypeToDisplayName)
  typeDisplay: string;

  @Expose()
  subtype: EnergySubtype;

  @Expose()
  @Transform(transformEnergySubtypeToDisplayName)
  subtypeDisplay: string;

  @Expose()
  value: number;

  @Expose()
  percentage: number;

  @Expose()
  description?: string;

  @Expose()
  date: Date;

  @Expose()
  createdAt: Date;
}

/**
 * Simplified response DTO with only display names (no enum values)
 * Useful for frontend consumption where only Spanish names are needed
 */
export class BalanceDisplayDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(transformEnergyTypeToDisplayName, { toPlainOnly: true })
  type: string;

  @Expose()
  @Transform(transformEnergySubtypeToDisplayName, { toPlainOnly: true })
  subtype: string;

  @Expose()
  value: number;

  @Expose()
  percentage: number;

  @Expose()
  description?: string;

  @Expose()
  date: Date;

  @Expose()
  createdAt: Date;
}
