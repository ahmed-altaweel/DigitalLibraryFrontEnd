import React from 'react';
import MaterialCard from '../MaterialCard/MaterialCard.jsx';
import Skeleton from '../../common/Skeleton/Skeleton.jsx';
import EmptyState from '../../common/EmptyState/EmptyState.jsx';
import { SearchX } from 'lucide-react';
import styles from './MaterialGrid.module.css';

export default function MaterialGrid({ materials = [], loading, emptyMessage = 'No materials found' }) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {[...Array(6)].map((_, i) => <Skeleton key={i} variant="card" />)}
      </div>
    );
  }

  if (!materials.length) {
    return <EmptyState icon={<SearchX size={32} />} title="No Results" description={emptyMessage} />;
  }

  return (
    <div className={styles.grid}>
      {materials.map((mat, i) => <MaterialCard key={i} material={mat} />)}
    </div>
  );
}
