import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (!value) return true;
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;

    // Compare date portions only (YYYY-MM-DD) to avoid timezone issues
    const inputDate = value.slice(0, 10); // '2026-03-01' from '2026-03-01' or '2026-03-01T00:00:00Z'
    const todayStr = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD' format
    return inputDate >= todayStr;
  }

  defaultMessage(): string {
    return 'تاریخ سررسید نمی‌تواند در گذشته باشد';
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}
