import { BadRequestException, ValidationError } from '@nestjs/common';

const buildPropertyPath = (error: ValidationError, parentPath = ''): string => {
  const path = parentPath
    ? error.property.match(/^\d+$/)
      ? `${parentPath}[${error.property}]`
      : `${parentPath}.${error.property}`
    : error.property;

  return path;
}

const extractFirstConstraint = (errors: ValidationError[], parentPath = ''): string | null => {
  for (const error of errors) {
    const currentPath = buildPropertyPath(error, parentPath);

    if (error.constraints) {
      const message = Object.values(error.constraints)[0];
      return `${message}`;
    }

    if (error.children && error.children.length > 0) {
      const childMessage = extractFirstConstraint(error.children, currentPath);
      if (childMessage) return childMessage;
    }
  }
  return null;
}

export const globalValidationExceptionFactory = (errors: ValidationError[]) => {
  const message = extractFirstConstraint(errors) || 'Error de validación';
  return new BadRequestException({
    statusCode: 400,
    timestamp: new Date().toISOString(),
    message,
  });
};