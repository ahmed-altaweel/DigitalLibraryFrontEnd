import React from 'react';
import styles from './Button.module.css';

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, iconLeft, iconRight, fullWidth, className = '', ...props
}) {
  const classes = [styles.button, styles[variant], styles[size], fullWidth ? styles.fullWidth : '', className].filter(Boolean).join(' ');
  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <span className={styles.spinner} />}
      {!loading && iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      <span className={styles.content}>{children}</span>
      {!loading && iconRight && <span className={styles.icon}>{iconRight}</span>}
    </button>
  );
}
