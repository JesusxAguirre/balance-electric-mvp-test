import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

/**
 * Decorador que combina @IsOptional y transforma '' o null en undefined.
 */
export function CleanOptional(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    IsOptional()(target, propertyKey);
    Transform(({ value }): any =>
      value === '' || value === null ? undefined : value,
    )(target, propertyKey);
  };
}
