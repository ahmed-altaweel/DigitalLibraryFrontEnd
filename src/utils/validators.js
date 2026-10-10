/**
 * Validate email format
 * @param {string} email
 * @returns {string|null} Error message or null if valid
 */
export function validateEmail(email) {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {string|null} Error message or null if valid
 */
export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  return null;
}

/**
 * Validate required field
 * @param {string} value
 * @param {string} fieldName
 * @returns {string|null}
 */
export function validateRequired(value, fieldName = 'This field') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Validate maximum length
 * @param {string} value
 * @param {number} maxLength
 * @param {string} fieldName
 * @returns {string|null}
 */
export function validateMaxLength(value, maxLength, fieldName = 'This field') {
  if (value && value.length > maxLength) {
    return `${fieldName} must be ${maxLength} characters or less`;
  }
  return null;
}

/**
 * Validate minimum length
 * @param {string} value
 * @param {number} minLength
 * @param {string} fieldName
 * @returns {string|null}
 */
export function validateMinLength(value, minLength, fieldName = 'This field') {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
}

/**
 * Validate username format
 * @param {string} username
 * @returns {string|null}
 */
export function validateUsername(username) {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 50) return 'Username must be 50 characters or less';
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return 'Username can only contain letters, numbers, hyphens, and underscores';
  }
  return null;
}

/**
 * Validate URL format
 * @param {string} url
 * @returns {string|null}
 */
export function validateUrl(url) {
  if (!url) return null; // Optional field
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
}

/**
 * Run multiple validators on a form data object
 * @param {object} data - Form data
 * @param {object} rules - Validation rules { fieldName: [validator1, validator2, ...] }
 * @returns {object} errors - { fieldName: errorMessage }
 */
export function validateForm(data, rules) {
  const errors = {};
  for (const [field, validators] of Object.entries(rules)) {
    for (const validator of validators) {
      const error = validator(data[field]);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  }
  return errors;
}

/**
 * Check if a form errors object has any errors
 * @param {object} errors
 * @returns {boolean}
 */
export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
