export function getPartitionsTotal(partitions) {
  return partitions.reduce((sum, partition) => sum + Number(partition.balance || 0), 0);
}

export function getUnallocated(accountBalance, partitionsTotal) {
  return Number(accountBalance) - partitionsTotal;
}

export function canAllocate(accountBalance, partitions, newPartitionBalance, excludePartitionId = null) {
  const otherTotal = partitions
    .filter((p) => p.$id !== excludePartitionId)
    .reduce((sum, p) => sum + Number(p.balance || 0), 0);

  const newTotal = otherTotal + Number(newPartitionBalance);
  return newTotal <= Number(accountBalance);
}

export function canDeleteAccount(partitions) {
  return partitions.length === 0;
}
