import { ValidationError } from 'class-validator';

export const capitalizeFirst = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatValidationErrors = (errors: ValidationError[]): any[] => {
  return errors.map((error) => ({
    property: error.property,
    value: error.value,
    constraints: error.constraints,
    children: error.children?.length
      ? formatValidationErrors(error.children)
      : undefined,
  }));
};
