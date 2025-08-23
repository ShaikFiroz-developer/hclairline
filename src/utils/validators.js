// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^[0-9]{10,15}$/,
  name: /^[a-zA-Z\s-']+$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  numeric: /^[0-9]+$/,
  flightNumber: /^[A-Za-z]{2,3}\d{3,4}$/,
  iataCode: /^[A-Z]{3}$/,
};

// Common validation messages
export const messages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  password: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
  phone: 'Please enter a valid phone number',
  name: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  alphanumeric: 'This field can only contain letters and numbers',
  numeric: 'This field can only contain numbers',
  minLength: (length) => `Must be at least ${length} characters long`,
  maxLength: (length) => `Cannot be longer than ${length} characters`,
  minValue: (value) => `Must be at least ${value}`,
  maxValue: (value) => `Cannot be more than ${value}`,
  flightNumber: 'Invalid flight number format (e.g., AA123 or UAL4567)',
  iataCode: 'IATA code must be exactly 3 uppercase letters',
};

// Common validation functions
export const validators = {
  required: (value) => (value ? undefined : messages.required),
  email: (value) => (value && patterns.email.test(value) ? undefined : messages.email),
  password: (value) => (value && patterns.password.test(value) ? undefined : messages.password),
  phone: (value) => (value && patterns.phone.test(value) ? undefined : messages.phone),
  name: (value) => (value && patterns.name.test(value) ? undefined : messages.name),
  alphanumeric: (value) => (value && patterns.alphanumeric.test(value) ? undefined : messages.alphanumeric),
  numeric: (value) => (value && patterns.numeric.test(value) ? undefined : messages.numeric),
  minLength: (length) => (value) =>
    value && value.length >= length ? undefined : messages.minLength(length),
  maxLength: (length) => (value) =>
    value && value.length <= length ? undefined : messages.maxLength(length),
  minValue: (min) => (value) =>
    value >= min ? undefined : messages.minValue(min),
  maxValue: (max) => (value) =>
    value <= max ? undefined : messages.maxValue(max),
  flightNumber: (value) =>
    value && patterns.flightNumber.test(value) ? undefined : messages.flightNumber,
  iataCode: (value) =>
    value && patterns.iataCode.test(value) ? undefined : messages.iataCode,
};

// Compose multiple validators
export const composeValidators = (...validators) => (value) =>
  validators.reduce((error, validator) => error || validator(value), undefined);

// Common form field validations
export const fieldValidators = {
  email: composeValidators(validators.required, validators.email),
  password: composeValidators(validators.required, validators.password),
  name: composeValidators(validators.required, validators.name, validators.maxLength(50)),
  phone: composeValidators(validators.required, validators.phone),
  required: validators.required,
  flightNumber: composeValidators(validators.required, validators.flightNumber),
  iataCode: composeValidators(validators.required, validators.iataCode),
  numeric: composeValidators(validators.required, validators.numeric),
};

// Form validation helper
export const validateForm = (values, validationSchema) => {
  const errors = {};
  
  Object.keys(validationSchema).forEach((field) => {
    const validator = validationSchema[field];
    const value = values[field];
    const error = validator(value);
    
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

export default {
  patterns,
  messages,
  validators,
  fieldValidators,
  validateForm,
  composeValidators,
};
