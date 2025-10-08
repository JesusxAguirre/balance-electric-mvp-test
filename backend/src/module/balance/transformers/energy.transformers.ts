import { ValueTransformer } from 'typeorm';
import { TransformFnParams } from 'class-transformer';
import {
  EnergyType,
  EnergySubtype,
  getEnergyTypeFromDisplayName,
  getEnergySubtypeFromDisplayName,
  getEnergyTypeDisplayName,
  getEnergySubtypeDisplayName,
} from '../entities/energy.enums';

/**
 * TypeORM transformer for EnergyType
 * Converts between enum values and Spanish display names in the database
 */
export class EnergyTypeTransformer implements ValueTransformer {
  /**
   * Transform enum to database value (can be enum value or display name)
   * @param value - The enum value from the entity
   * @returns The value to store in the database
   */
  to(value: EnergyType | null | undefined): string | null {
    if (!value) return null;
    // Store the enum value in the database
    return value;
  }

  /**
   * Transform database value to enum
   * @param value - The value from the database
   * @returns The enum value for the entity
   */
  from(value: string | null | undefined): EnergyType | null {
    if (!value) return null;
    
    // Try to match as enum value first
    if (Object.values(EnergyType).includes(value as EnergyType)) {
      return value as EnergyType;
    }
    
    // Try to match as Spanish display name
    const enumValue = getEnergyTypeFromDisplayName(value);
    return enumValue || null;
  }
}

/**
 * TypeORM transformer for EnergySubtype
 * Converts between enum values and Spanish display names in the database
 */
export class EnergySubtypeTransformer implements ValueTransformer {
  /**
   * Transform enum to database value
   * @param value - The enum value from the entity
   * @returns The value to store in the database
   */
  to(value: EnergySubtype | null | undefined): string | null {
    if (!value) return null;
    // Store the enum value in the database
    return value;
  }

  /**
   * Transform database value to enum
   * @param value - The value from the database
   * @returns The enum value for the entity
   */
  from(value: string | null | undefined): EnergySubtype | null {
    if (!value) return null;
    
    // Try to match as enum value first
    if (Object.values(EnergySubtype).includes(value as EnergySubtype)) {
      return value as EnergySubtype;
    }
    
    // Try to match as Spanish display name
    const enumValue = getEnergySubtypeFromDisplayName(value);
    return enumValue || null;
  }
}

/**
 * class-transformer function for DTO: String to EnergyType
 * Accepts both enum values and Spanish display names
 */
export function transformToEnergyType(params: TransformFnParams): EnergyType | undefined {
  const { value } = params;
  
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  // Try as enum value first
  if (Object.values(EnergyType).includes(value as EnergyType)) {
    return value as EnergyType;
  }

  // Try as Spanish display name
  return getEnergyTypeFromDisplayName(value);
}

/**
 * class-transformer function for DTO: String to EnergySubtype
 * Accepts both enum values and Spanish display names
 */
export function transformToEnergySubtype(params: TransformFnParams): EnergySubtype | undefined {
  const { value } = params;
  
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  // Try as enum value first
  if (Object.values(EnergySubtype).includes(value as EnergySubtype)) {
    return value as EnergySubtype;
  }

  // Try as Spanish display name
  return getEnergySubtypeFromDisplayName(value);
}

/**
 * class-transformer function for response: EnergyType to Spanish display name
 */
export function transformEnergyTypeToDisplayName(params: TransformFnParams): string | undefined {
  const { value } = params;
  
  if (!value) {
    return undefined;
  }

  return getEnergyTypeDisplayName(value as EnergyType);
}

/**
 * class-transformer function for response: EnergySubtype to Spanish display name
 */
export function transformEnergySubtypeToDisplayName(params: TransformFnParams): string | undefined {
  const { value } = params;
  
  if (!value) {
    return undefined;
  }

  return getEnergySubtypeDisplayName(value as EnergySubtype);
}

/**
 * Singleton instances for TypeORM transformers
 */
export const energyTypeTransformer = new EnergyTypeTransformer();
export const energySubtypeTransformer = new EnergySubtypeTransformer();
