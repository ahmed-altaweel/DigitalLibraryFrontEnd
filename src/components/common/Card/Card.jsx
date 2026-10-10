import React from 'react';
import styles from './Card.module.css';
export default function Card({ children, header, footer, variant = 'default', clickable, className = '', onClick, ...props }) {
  return (
    <div className={`${styles.card} ${styles[variant]} ${clickable ? styles.clickable : ''} ${className}`} onClick={onClick} {...props}>
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
