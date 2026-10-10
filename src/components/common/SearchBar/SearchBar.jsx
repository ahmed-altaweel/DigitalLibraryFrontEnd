import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import styles from './SearchBar.module.css';

export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search...', className = '' }) {
  const [localValue, setLocalValue] = useState(value || '');
  const timeoutRef = useRef();

  useEffect(() => { setLocalValue(value || ''); }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onChange?.(val), 300);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSubmit?.(localValue);
  };

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <Search className={styles.iconLeft} size={18} />
      <input type="text" className={styles.input} value={localValue} onChange={handleChange} onKeyDown={handleKeyDown} placeholder={placeholder} />
      {localValue && (
        <button type="button" className={styles.clearBtn} onClick={handleClear}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
