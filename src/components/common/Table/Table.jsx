import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import styles from './Table.module.css';
import Skeleton from '../Skeleton/Skeleton.jsx';
import EmptyState from '../EmptyState/EmptyState.jsx';

export default function Table({ columns, data, sortCol, sortDir, onSort, loading, emptyMessage = 'No data available' }) {
  if (loading) {
    return (
      <div className={styles.container}>
        <table className={styles.table}>
          <thead><tr>{columns.map((c, i) => <th key={i}>{c.label}</th>)}</tr></thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>{columns.map((_, j) => <td key={j}><Skeleton /></td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (!data || data.length === 0) return <EmptyState title="No Records" description={emptyMessage} />;
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} onClick={() => col.sortable && onSort?.(col.key)} className={col.sortable ? styles.sortable : ''}>
                <div className={styles.thContent}>
                  {col.label}
                  {col.sortable && sortCol === col.key && (sortDir === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col, j) => (
                <td key={j}>{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
