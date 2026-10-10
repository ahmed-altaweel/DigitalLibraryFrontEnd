import React, { forwardRef } from 'react';
import styles from './Select.module.css';

const Select = forwardRef(({ label, error, options = [], placeholder, className = '', ...props }, ref) => {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <select ref={ref} className={`${styles.select} ${error ? styles.hasError : ''}`} {...props}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
});
export default Select;
