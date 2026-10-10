import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import styles from './Toast.module.css';

const icons = { success: CheckCircle, error: AlertCircle, info: Info, warning: AlertTriangle };

export default function Toast({ message, type = 'info', onClose }) {
  const Icon = icons[type] || Info;
  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <Icon className={styles.icon} size={20} />
      <div className={styles.message}>{message}</div>
      {onClose && <button className={styles.close} onClick={onClose}><X size={16} /></button>}
    </div>
  );
}
