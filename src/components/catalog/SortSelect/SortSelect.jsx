import React from 'react';
import Select from '../../common/Select/Select.jsx';
import styles from './SortSelect.module.css';

const OPTIONS = [
  { value: 'title_asc', label: 'Title (A-Z)' },
  { value: 'title_desc', label: 'Title (Z-A)' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most_viewed', label: 'Most Viewed' }
];

export default function SortSelect({ value, onChange }) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Sort by:</span>
      <Select options={OPTIONS} value={value || 'newest'} onChange={(e) => onChange(e.target.value)} className={styles.select} />
    </div>
  );
}
