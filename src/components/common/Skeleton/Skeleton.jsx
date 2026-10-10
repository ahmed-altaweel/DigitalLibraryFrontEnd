import React from 'react';
import styles from './Skeleton.module.css';

export default function Skeleton({ variant = 'text', width, height, className = '' }) {
  const style = { width, height };
  return <div className={`${styles.skeleton} ${styles[variant]} ${className}`} style={style} />;
}
