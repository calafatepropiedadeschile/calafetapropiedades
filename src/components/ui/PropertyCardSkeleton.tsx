import styles from './PropertyCardSkeleton.module.css';

export default function PropertyCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.image} />
      <div className={styles.body}>
        <div className={styles.price} />
        <div className={styles.title} />
        <div className={styles.titleShort} />
        <div className={styles.location} />
        <div className={styles.divider} />
        <div className={styles.specs}>
          <div className={styles.spec} />
          <div className={styles.spec} />
          <div className={styles.spec} />
        </div>
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="properties-grid">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
