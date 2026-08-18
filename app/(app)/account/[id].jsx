import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
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
          <PrimaryButton label="Go back" onPress={() => router.back()} className="mt-4 px-6" />
        </View>
      </ScreenContainer>
    );
  }

  const partitionsTotal = getPartitionsTotal(partitions);
  const unallocated = getUnallocated(account.balance, partitionsTotal);

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
    <ScreenContainer>
      <View className="flex-1 px-6 pt-4">
        <Pressable onPress={() => router.back()} className="mb-4 self-start">
          <Text className="text-base font-medium text-brand-600">← Back</Text>
        </Pressable>

        <Card className="border-brand-200 bg-brand-50 dark:border-brand-700 dark:bg-brand-600/10">
          <Text className="text-sm font-medium uppercase tracking-wide text-brand-700 dark:text-brand-100">
            {account.currency}
          </Text>
          <Text className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {account.name}
          </Text>
          <Text className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(account.balance, account.currency)}
          </Text>
        </Card>

        <Card
          className={`mt-4 ${
            unallocated > 0
              ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20'
              : ''
          }`}>
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Unallocated
          </Text>
          <Text
            className={`mt-1 text-xl font-bold ${
              unallocated > 0
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-gray-900 dark:text-white'
            }`}>
            {formatCurrency(unallocated, account.currency)}
          </Text>
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Allocated: {formatCurrency(partitionsTotal, account.currency)}
          </Text>
        </Card>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            Partitions
          </Text>
          <PrimaryButton label="+ Add" onPress={openCreateModal} className="px-4 py-2" />
        </View>

        {partitionError && !modalVisible ? (
          <Text className="mt-3 text-sm text-red-500">{String(partitionError)}</Text>
        ) : null}

        {partitionsLoading && partitions.length === 0 ? (
          <View className="mt-8 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : partitions.length === 0 ? (
          <EmptyState
            title="No partitions yet"
            subtitle="Split your balance into business, salary, etc."
            actionLabel="Add partition"
            onAction={openCreateModal}
          />
        ) : (
          <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
            <View className="gap-3">
              {partitions.map((partition) => (
                <Card key={partition.$id}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">
                        {partition.name}
                      </Text>
                      <Text className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(partition.balance, account.currency)}
                      </Text>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable
                        className="rounded-lg bg-gray-100 px-3 py-1.5 dark:bg-gray-800"
                        onPress={() => openEditModal(partition)}>
                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Edit
                        </Text>
                      </Pressable>
                      <Pressable
                        className="rounded-lg bg-expense-50 px-3 py-1.5 dark:bg-expense-500/10"
                        onPress={() => handleDeletePartition(partition)}>
                        <Text className="text-sm font-medium text-expense-600">Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl bg-white p-6 dark:bg-gray-900">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              {editingPartition ? 'Edit partition' : 'New partition'}
            </Text>

            <View className="mt-6 gap-4">
              <View>
                <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </Text>
                <TextInput
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Business"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  editable={!mutationLoading}
                />
              </View>

              <View>
                <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allocated amount
                </Text>
                <TextInput
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  value={balance}
                  onChangeText={setBalance}
                  editable={!mutationLoading}
                />
              </View>

              {partitionError && modalVisible ? (
                <Text className="text-sm text-red-500">{String(partitionError)}</Text>
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
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
