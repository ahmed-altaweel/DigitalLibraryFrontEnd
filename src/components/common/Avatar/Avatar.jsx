import React, { useState } from 'react';
import styles from './Avatar.module.css';
import { getInitials } from '../../../utils/formatters.js';

export default function Avatar({ src, alt, name, size = 'md', className = '' }) {
  const [error, setError] = useState(false);
  const initials = name ? getInitials(name) : '?';

  return (
    <div className={`${styles.avatar} ${styles[size]} ${className}`}>
      {src && !error ? (
        <img src={src} alt={alt || name} onError={() => setError(true)} className={styles.image} />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </div>
  );
}
