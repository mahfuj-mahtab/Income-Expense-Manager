import {
  PARTITION_COLORS,
  UNALLOCATED_COLOR,
  pickColor,
} from '@/constants/chartColors';
import { getPartitionsTotal, getUnallocated } from '@/lib/accounts/validation';

export function buildPartitionChartData(account, partitions) {
  if (!account) return [];

  const slices = partitions
    .filter((partition) => Number(partition.balance) > 0)
    .map((partition, index) => ({
      label: partition.name,
      value: Number(partition.balance) || 0,
      color: pickColor(PARTITION_COLORS, index),
    }));

  const partitionsTotal = getPartitionsTotal(partitions);
  const unallocated = getUnallocated(account.balance, partitionsTotal);

  if (unallocated > 0) {
    slices.push({
      label: 'Unallocated',
      value: unallocated,
      color: UNALLOCATED_COLOR,
    });
  }

  return slices.sort((a, b) => b.value - a.value);
}
