import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const PRESET_AVATAR_PATTERN = /^av\d+$/;

@ValidatorConstraint({ async: false })
export class IsValidAvatarConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value !== 'string') return false;
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
      return value.length <= 500;
    }
    return PRESET_AVATAR_PATTERN.test(value) || /^\d+$/.test(value);
  }

  defaultMessage(): string {
    return `شناسه آواتار نامعتبر است`;
  }
}

export function IsValidAvatar(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidAvatarConstraint,
    });
  };
}
