import React from 'react';
import Button from '../Button/Button.jsx';
import styles from './EmptyState.module.css';

export default function EmptyState({
  icon,
  title,
  description,
  action,
  actionText,
  onAction,
  actionVariant = 'primary'
}) {
  return (
    <div className={styles.container} role="status">
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
      {!action && actionText && onAction && (
        <div className={styles.action}>
          <Button variant={actionVariant} onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
