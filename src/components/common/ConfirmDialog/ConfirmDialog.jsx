import React from 'react';
import Modal from '../Modal/Modal.jsx';
import Button from '../Button/Button.jsx';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  const footer = (
    <>
      <Button variant="ghost" onClick={onCancel}>{cancelText}</Button>
      <Button variant="danger" onClick={onConfirm}>{confirmText}</Button>
    </>
  );
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} footer={footer}>
      <p className={styles.message}>{message}</p>
    </Modal>
  );
}
