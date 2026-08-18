import { router } from 'expo-router';
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

import { CurrencyPicker } from '@/components/accounts/CurrencyPicker';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { CURRENCIES } from '@/constants/currencies';
import { formatCurrency } from '@/lib/accounts/formatCurrency';
import { useAppDispatch } from '@/store/hooks';
import {
  appApi,
  useCreateBankAccountMutation,
  useDeleteBankAccountMutation,
  useGetBankAccountsQuery,
  useUpdateBankAccountMutation,
} from '@/store/api/appApi';

export default function AccountsScreen() {
  const dispatch = useAppDispatch();
  const { data: items = [], isLoading, error } = useGetBankAccountsQuery();
  const [createBankAccount, { isLoading: isCreating, error: createError }] =
    useCreateBankAccountMutation();
  const [updateBankAccount, { isLoading: isUpdating, error: updateError }] =
    useUpdateBankAccountMutation();
  const [deleteBankAccount] = useDeleteBankAccountMutation();

  const mutationLoading = isCreating || isUpdating;
  const mutationError = createError || updateError;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState(CURRENCIES[0].code);

  const openCreateModal = () => {
    setEditingAccount(null);
    setName('');
    setBalance('');
    setCurrency(CURRENCIES[0].code);
    setModalVisible(true);
  };

  const openEditModal = (account) => {
    setEditingAccount(account);
    setName(account.name);
    setBalance(String(account.balance));
    setCurrency(account.currency);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingAccount(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !balance) return;

    const payload = {
      name: name.trim(),
      balance: parseFloat(balance),
      currency,
    };

    try {
      if (editingAccount) {
        await updateBankAccount({ id: editingAccount.$id, ...payload }).unwrap();
      } else {
        await createBankAccount(payload).unwrap();
      }
      closeModal();
    } catch {
      // error shown via mutationError
    }
  };

  const handleDelete = async (accountItem) => {
    try {
      const partitionsResult = await dispatch(
        appApi.endpoints.getPartitions.initiate(accountItem.$id)
      );
      const partitions = partitionsResult.data ?? [];

      if (partitions.length > 0) {
        Alert.alert(
          'Cannot delete',
          'Delete all partitions before deleting this account.'
        );
        return;
      }
    } catch {
      // continue to server-side check
    }

    Alert.alert('Delete account', `Delete "${accountItem.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBankAccount(accountItem.$id).unwrap();
          } catch (err) {
            Alert.alert('Error', err?.data || err?.error || 'Failed to delete account.');
          }
        },
      },
    ]);
  };

  const displayError =
    typeof error === 'string'
      ? error
      : error?.error
        ? String(error.error)
        : null;

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 pt-6">
        <ScreenHeader
          title="Accounts"
          subtitle="Manage your bank accounts and balances"
          action={
            <PrimaryButton
              label="+ Add"
              onPress={openCreateModal}
              className="px-4 py-2"
            />
          }
        />

        {displayError && !modalVisible ? (
          <Text className="mt-4 text-sm text-red-500">{displayError}</Text>
        ) : null}

        {isLoading && items.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : items.length === 0 ? (
          <EmptyState
            title="No bank accounts yet"
            subtitle="Create your first account to start tracking"
            actionLabel="Create account"
            onAction={openCreateModal}
          />
        ) : (
          <ScrollView className="mt-6" showsVerticalScrollIndicator={false}>
            <View className="gap-3">
              {items.map((accountItem) => (
                <Card key={accountItem.$id} className="p-0">
                  <Pressable
                    className="p-4 active:opacity-80"
                    onPress={() => router.push(`/account/${accountItem.$id}`)}>
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                          {accountItem.name}
                        </Text>
                        <Text className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(accountItem.balance, accountItem.currency)}
                        </Text>
                        <View className="mt-2 self-start rounded-full bg-brand-50 px-2.5 py-0.5 dark:bg-brand-600/20">
                          <Text className="text-xs font-medium text-brand-700 dark:text-brand-100">
                            {accountItem.currency}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row gap-2">
                        <Pressable
                          className="rounded-lg bg-gray-100 px-3 py-1.5 dark:bg-gray-800"
                          onPress={() => openEditModal(accountItem)}>
                          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Edit
                          </Text>
                        </Pressable>
                        <Pressable
                          className="rounded-lg bg-expense-50 px-3 py-1.5 dark:bg-expense-500/10"
                          onPress={() => handleDelete(accountItem)}>
                          <Text className="text-sm font-medium text-expense-600">Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
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
              {editingAccount ? 'Edit account' : 'New account'}
            </Text>

            <View className="mt-6 gap-4">
              <View>
                <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </Text>
                <TextInput
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Main bank"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  editable={!mutationLoading}
                />
              </View>

              <View>
                <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Balance
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

              <View>
                <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Currency
                </Text>
                <CurrencyPicker
                  value={currency}
                  onChange={setCurrency}
                  disabled={mutationLoading}
                />
              </View>

              {mutationError ? (
                <Text className="text-sm text-red-500">
                  {mutationError?.data || mutationError?.error || 'Something went wrong'}
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
                  onPress={handleSave}
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
