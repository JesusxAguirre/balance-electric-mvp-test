import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import {
  EnergyType,
  EnergySubtype,
  isValidEnergyPair,
  getEnergyTypeDisplayName,
  getEnergySubtypeDisplayName,
  getParentEnergyType
} from '../../entities/energy.enums';

/**
 * Validator contraints (functions to use in decorator )
 */
@ValidatorConstraint({ name: 'isValidEnergyPair', async: false })
export class IsValidEnergyPairConstraint implements ValidatorConstraintInterface {
  validate(subtype: any, args: ValidationArguments): boolean {
    const [typePropertyName] = args.constraints;
    const type = (args.object as any)[typePropertyName];

    if (!type || !subtype) {
      return false;
    }

    return isValidEnergyPair(type as EnergyType, subtype as EnergySubtype);
  }

  defaultMessage(args: ValidationArguments): string {
    const [typePropertyName] = args.constraints;
    const type = (args.object as any)[typePropertyName] as EnergyType;
    const subtype = args.value as EnergySubtype;

    if (!type || !subtype) {
      return 'Energy type and subtype are required';
    }

    const expectedType = getParentEnergyType(subtype);
    const typeDisplay = getEnergyTypeDisplayName(type);
    const subtypeDisplay = getEnergySubtypeDisplayName(subtype);
    const expectedTypeDisplay = expectedType ? getEnergyTypeDisplayName(expectedType) : 'unknown';

    return `Invalid energy pairing: "${subtypeDisplay}" cannot belong to "${typeDisplay}". Expected type: "${expectedTypeDisplay}"`;
  }
}

/**
 * Decorator to validate energy type-subtype pairing
 * @param typeProperty - The name of the property containing the energy type
 * @param validationOptions - Additional validation options
 * 
 * @example
 * class CreateBalanceDto {
 *   @IsEnum(EnergyType)
 *   type: EnergyType;
 * 
 *   @IsEnum(EnergySubtype)
 *   @IsValidEnergyPair('type')
 *   subtype: EnergySubtype;
 * }
 */
export function IsValidEnergyPair(
  typeProperty: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsValidEnergyPair',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [typeProperty],
      validator: IsValidEnergyPairConstraint
    });
  };
}
