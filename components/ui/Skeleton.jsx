import { View } from 'react-native';

export function Skeleton({ className = '', height = 16 }) {
  return (
    <View
      className={`rounded-lg bg-border/60 dark:bg-border-dark/60 ${className}`}
      style={{ height }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <View className="min-w-[100px] flex-1 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-card">
      <Skeleton height={12} className="w-16" />
      <Skeleton height={24} className="mt-2 w-24" />
    </View>
  );
}

export function ListItemSkeleton() {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-card">
      <Skeleton height={40} className="w-10 rounded-full" />
      <View className="flex-1 gap-2">
        <Skeleton height={14} className="w-3/4" />
        <Skeleton height={12} className="w-1/2" />
      </View>
      <Skeleton height={16} className="w-16" />
    </View>
  );
}
