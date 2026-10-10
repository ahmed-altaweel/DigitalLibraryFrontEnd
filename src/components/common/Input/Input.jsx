import React, { useState, forwardRef, useId } from 'react';
import styles from './Input.module.css';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  hint,
  helperText,
  icon,
  type = 'text',
  textarea = false,
  className = '',
  id: customId,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const hintText = helperText || hint;

  const [showPwd, setShowPwd] = useState(false);
  const inputType = type === 'password' ? (showPwd ? 'text' : 'password') : type;
  const Comp = textarea ? 'textarea' : 'input';

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputContainer}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <Comp
          ref={ref}
          id={inputId}
          type={textarea ? undefined : inputType}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hintText ? hintId : undefined}
          className={`${styles.input} ${icon ? styles.hasIcon : ''} ${error ? styles.hasError : ''}`}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            className={styles.pwdToggle}
            onClick={() => setShowPwd(!showPwd)}
            aria-label={showPwd ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
      {!error && hintText && (
        <p id={hintId} className={styles.hint}>
          {hintText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
