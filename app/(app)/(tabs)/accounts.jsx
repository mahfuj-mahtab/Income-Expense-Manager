import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { AccountCard } from '@/components/accounts/AccountCard';
import { CurrencyPicker } from '@/components/accounts/CurrencyPicker';
import { AccountsSummaryHero } from '@/components/ui/ScreenDecor';
import { EmptyState } from '@/components/ui/EmptyState';
import { Fab } from '@/components/ui/Fab';
import { FormField } from '@/components/ui/FormField';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ScreenEnter } from '@/components/ui/ScreenEnter';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { CURRENCIES } from '@/constants/currencies';
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
  const { data: items = [], isLoading, error, refetch } = useGetBankAccountsQuery();
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
  const [refreshing, setRefreshing] = useState(false);

  const summaryByCurrency = useMemo(() => {
    const map = {};
    items.forEach((account) => {
      map[account.currency] = (map[account.currency] ?? 0) + account.balance;
    });
    return Object.entries(map);
  }, [items]);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const displayError =
    typeof error === 'string'
      ? error
      : error?.error
        ? String(error.error)
        : null;

  return (
    <ScreenContainer>
      <ScreenEnter fill>
      <View className="flex-1 px-6 pt-6">
        <ScreenHeader
          title="Accounts"
          subtitle={`${items.length} account${items.length === 1 ? '' : 's'} · tap to view partitions`}
        />

        <AccountsSummaryHero summaries={summaryByCurrency} />

        {displayError && !modalVisible ? (
          <Text className="mt-4 text-sm font-medium text-expense-600 dark:text-expense-500">
            {displayError}
          </Text>
        ) : null}

        {isLoading && items.length === 0 ? (
          <View className="mt-6 gap-3">
            <ListItemSkeleton />
            <ListItemSkeleton />
          </View>
        ) : items.length === 0 ? (
          <EmptyState
            title="No bank accounts yet"
            subtitle="Create your first account to start tracking"
            actionLabel="Create account"
            onAction={openCreateModal}
          />
        ) : (
          <ScrollView
            className="mt-6"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#133458" />
            }>
            <View className="gap-4 pb-24">
              {items.map((accountItem, index) => (
                <AccountCard
                  key={accountItem.$id}
                  name={accountItem.name}
                  currency={accountItem.currency}
                  balance={accountItem.balance}
                  index={index}
                  onPress={() => router.push(`/account/${accountItem.$id}`)}
                  onEdit={() => openEditModal(accountItem)}
                  onDelete={() => handleDelete(accountItem)}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
      </ScreenEnter>

      {items.length > 0 ? <Fab onPress={openCreateModal} accessibilityLabel="Add account" /> : null}

      <ModalSheet
        visible={modalVisible}
        onClose={closeModal}
        title={editingAccount ? 'Edit account' : 'New account'}>
        <View className="gap-4">
          <FormField
            label="Name"
            placeholder="Main bank"
            value={name}
            onChangeText={setName}
            editable={!mutationLoading}
          />

          <FormField
            label="Balance"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={balance}
            onChangeText={setBalance}
            editable={!mutationLoading}
          />

          <FormField label="Currency">
            <CurrencyPicker
              value={currency}
              onChange={setCurrency}
              disabled={mutationLoading}
            />
          </FormField>

          {mutationError ? (
            <Text className="text-sm font-medium text-expense-600 dark:text-expense-500">
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
      </ModalSheet>
    </ScreenContainer>
  );
}
