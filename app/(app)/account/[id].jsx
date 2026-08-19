import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    View,
} from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormField } from '@/components/ui/FormField';
import { IconButton } from '@/components/ui/IconButton';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/accounts/formatCurrency';
import {
    getPartitionsTotal,
    getUnallocated,
} from '@/lib/accounts/validation';
import {
    useCreatePartitionMutation,
    useDeletePartitionMutation,
    useGetBankAccountsQuery,
    useGetPartitionsQuery,
    useUpdatePartitionMutation,
} from '@/store/api/appApi';

function AllocationBar({ allocated, total, currency }) {
  const percentage = total > 0 ? Math.min((allocated / total) * 100, 100) : 0;

  return (
    <View className="mt-4">
      <View className="flex-row justify-between">
        <Text className="text-sm font-semibold text-white/80">Allocated</Text>
        <Text className="text-sm font-bold text-white">
          {formatCurrency(allocated, currency)} ({percentage.toFixed(0)}%)
        </Text>
      </View>
      <View className="mt-2 h-2.5 rounded-full bg-white/20">
        <View
          className="h-2.5 rounded-full bg-white"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}

function PartitionRow({ name, balance, currency, percentage, onEdit, onDelete }) {
  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card dark:border-border-dark dark:bg-surface-card">
      <View className="flex-row items-center gap-3 p-4">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-600/20">
          <Text className="text-sm font-bold text-primary dark:text-primary-50">
            {percentage.toFixed(0)}%
          </Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-content dark:text-white" numberOfLines={1}>
            {name}
          </Text>
          <View className="mt-1 h-1.5 rounded-full bg-border dark:bg-border-dark">
            <View
              className="h-1.5 rounded-full bg-primary"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </View>
        </View>
        <Text className="text-lg font-bold text-primary dark:text-white">
          {formatCurrency(balance, currency)}
        </Text>
      </View>
      <View className="flex-row justify-end gap-1 border-t border-border/60 px-3 py-2 dark:border-border-dark/60">
        <IconButton
          icon="pencil"
          onPress={onEdit}
          accessibilityLabel="Edit partition"
          size={34}
        />
        <IconButton
          icon="trash"
          onPress={onDelete}
          accessibilityLabel="Delete partition"
          size={34}
          color="#DC2626"
        />
      </View>
    </View>
  );
}

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams();
  const accountId = String(id);

  const { data: accounts = [] } = useGetBankAccountsQuery();
  const account = accounts.find((item) => item.$id === accountId);

  const {
    data: partitions = [],
    isLoading: partitionsLoading,
    error: partitionsQueryError,
  } = useGetPartitionsQuery(accountId);

  const [createPartition, { isLoading: isCreating, error: createError }] =
    useCreatePartitionMutation();
  const [updatePartition, { isLoading: isUpdating, error: updateError }] =
    useUpdatePartitionMutation();
  const [deletePartition, { isLoading: isDeleting }] = useDeletePartitionMutation();

  const mutationLoading = isCreating || isUpdating || isDeleting;
  const partitionError =
    createError?.data ||
    createError?.error ||
    updateError?.data ||
    updateError?.error ||
    partitionsQueryError?.data ||
    partitionsQueryError?.error ||
    null;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingPartition, setEditingPartition] = useState(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');

  if (!account) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <EmptyState title="Account not found" />
        </View>
      </ScreenContainer>
    );
  }

  const partitionsTotal = getPartitionsTotal(partitions);
  const unallocated = getUnallocated(account.balance, partitionsTotal);
  const accountTotal = account.balance > 0 ? account.balance : 1;

  const openCreateModal = () => {
    setEditingPartition(null);
    setName('');
    setBalance('');
    setModalVisible(true);
  };

  const openEditModal = (partition) => {
    setEditingPartition(partition);
    setName(partition.name);
    setBalance(String(partition.balance));
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingPartition(null);
  };

  const handleSavePartition = async () => {
    if (!name.trim() || !balance) return;

    const payload = {
      bankAccountId: accountId,
      name: name.trim(),
      balance: parseFloat(balance),
    };

    try {
      if (editingPartition) {
        await updatePartition({
          id: editingPartition.$id,
          ...payload,
        }).unwrap();
      } else {
        await createPartition(payload).unwrap();
      }
      closeModal();
    } catch {
      // error shown in modal
    }
  };

  const handleDeletePartition = (partition) => {
    Alert.alert('Delete partition', `Delete "${partition.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePartition({
              id: partition.$id,
              bankAccountId: accountId,
            }).unwrap();
          } catch (err) {
            Alert.alert(
              'Error',
              err?.data || err?.error || 'Failed to delete partition.'
            );
          }
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: account.name }} />
      <ScreenContainer>
        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#133458', '#1a4a7a', '#0F2A47']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="overflow-hidden rounded-2xl shadow-elevated">
            <View className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" />
            <View className="p-5">
              <Badge label={account.currency} variant="light" />
              <Text className="mt-3 text-sm font-semibold uppercase tracking-widest text-white/70">
                {account.name}
              </Text>
              <Text className="mt-1 text-4xl font-bold text-white">
                {formatCurrency(account.balance, account.currency)}
              </Text>
              <AllocationBar
                allocated={partitionsTotal}
                total={account.balance}
                currency={account.currency}
              />
            </View>
          </LinearGradient>

          <View
            className={`mt-4 rounded-2xl border p-4 ${
              unallocated > 0
                ? 'border-warning-500 bg-warning-50 dark:border-warning-500/50 dark:bg-warning-500/10'
                : 'border-border bg-surface dark:border-border-dark dark:bg-surface-card'
            }`}>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold uppercase tracking-wide text-content-secondary dark:text-gray-300">
                Unallocated
              </Text>
              {unallocated > 0 ? <Badge label="Attention" variant="warning" /> : null}
            </View>
            <Text
              className={`mt-2 text-2xl font-bold ${
                unallocated > 0
                  ? 'text-warning-600 dark:text-warning-500'
                  : 'text-content dark:text-white'
              }`}>
              {formatCurrency(unallocated, account.currency)}
            </Text>
          </View>

          <View className="mt-6 flex-row items-center justify-between">
            <SectionHeader title="Partitions" className="mb-0" />
            <PrimaryButton label="+ Add" onPress={openCreateModal} className="px-4 py-2" />
          </View>

          {partitionError && !modalVisible ? (
            <Text className="mt-3 text-sm font-medium text-expense-600 dark:text-expense-500">
              {String(partitionError)}
            </Text>
          ) : null}

          {partitionsLoading && partitions.length === 0 ? (
            <View className="mt-4 gap-3">
              <ListItemSkeleton />
              <ListItemSkeleton />
            </View>
          ) : partitions.length === 0 ? (
            <EmptyState
              title="No partitions yet"
              subtitle="Split your balance into business, salary, etc."
              actionLabel="Add partition"
              onAction={openCreateModal}
            />
          ) : (
            <View className="mt-4 gap-3">
              {partitions.map((partition) => (
                <PartitionRow
                  key={partition.$id}
                  name={partition.name}
                  balance={partition.balance}
                  currency={account.currency}
                  percentage={(partition.balance / accountTotal) * 100}
                  onEdit={() => openEditModal(partition)}
                  onDelete={() => handleDeletePartition(partition)}
                />
              ))}
            </View>
          )}
          <View className="h-8" />
        </ScrollView>

        <ModalSheet
          visible={modalVisible}
          onClose={closeModal}
          title={editingPartition ? 'Edit partition' : 'New partition'}>
          <View className="gap-4">
            <FormField
              label="Name"
              placeholder="Business"
              value={name}
              onChangeText={setName}
              editable={!mutationLoading}
            />

            <FormField
              label="Allocated amount"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={balance}
              onChangeText={setBalance}
              editable={!mutationLoading}
            />

            {partitionError && modalVisible ? (
              <Text className="text-sm font-medium text-expense-600 dark:text-expense-500">
                {String(partitionError)}
              </Text>
            ) : null}

            <View className="flex-row gap-3">
              <SecondaryButton
                label="Cancel"
                onPress={closeModal}
                disabled={mutationLoading}
                className="flex-1"
              />
              <PrimaryButton
                label="Save"
                onPress={handleSavePartition}
                loading={mutationLoading}
                disabled={!name.trim() || !balance}
                className="flex-1"
              />
            </View>
          </View>
        </ModalSheet>
      </ScreenContainer>
    </>
  );
}
