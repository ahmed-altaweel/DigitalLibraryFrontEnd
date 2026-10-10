import React from 'react';
import Button from '../../common/Button/Button.jsx';
import Select from '../../common/Select/Select.jsx';
import styles from './FilterPanel.module.css';

const CONTENT_TYPES = ['book', 'article', 'paper', 'tutorial', 'notes', 'reference'];
const LANGUAGES = [
  { value: 'en', label: 'English' }, { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' }, { value: 'es', label: 'Spanish' }, { value: 'de', label: 'German' }
];

export default function FilterPanel({ filters = {}, onFilterChange, categories = [], tags = [] }) {
  
  const handleCheckbox = (type, val) => {
    const current = filters[type] || [];
    const updated = current.includes(val) ? current.filter(x => x !== val) : [...current, val];
    onFilterChange({ ...filters, [type]: updated });
  };

  const handleSelect = (e) => {
    onFilterChange({ ...filters, language: e.target.value });
  };

  const clearFilters = () => {
    onFilterChange({ types: [], categories: [], language: '', tags: [] });
  };

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
      </div>
      
      <div className={styles.section}>
        <h4 className={styles.subtitle}>Content Type</h4>
        {CONTENT_TYPES.map(type => (
          <label key={type} className={styles.checkbox}>
            <input type="checkbox" checked={filters.types?.includes(type)} onChange={() => handleCheckbox('types', type)} />
            <span className={styles.label}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
          </label>
        ))}
      </div>

      {categories.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.subtitle}>Categories</h4>
          {categories.map(cat => (
            <label key={cat.slug} className={styles.checkbox}>
              <input type="checkbox" checked={filters.categories?.includes(cat.slug)} onChange={() => handleCheckbox('categories', cat.slug)} />
              <span className={styles.label}>{cat.name}</span>
            </label>
          ))}
        </div>
      )}

      <div className={styles.section}>
        <h4 className={styles.subtitle}>Language</h4>
        <Select options={LANGUAGES} placeholder="Any Language" value={filters.language || ''} onChange={handleSelect} />
      </div>
    </aside>
  );
}
