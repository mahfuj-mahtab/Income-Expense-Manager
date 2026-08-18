import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { TransactionRow } from '@/components/transactions/TransactionRow';
import { ChipPicker } from '@/components/ui/ChipPicker';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { DateGroupHeader } from '@/components/ui/ScreenDecor';
import { EmptyState } from '@/components/ui/EmptyState';
import { Fab } from '@/components/ui/Fab';
import { FormField } from '@/components/ui/FormField';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { getPresetCategoriesByType } from '@/constants/presetCategories';
import { groupByDate } from '@/lib/ui/groupByDate';
import { useAppDispatch } from '@/store/hooks';
import {
  appApi,
  useCreateTransactionMutation,
  useDeleteTransactionMutation,
  useGetBankAccountsQuery,
  useGetCustomCategoriesQuery,
  useGetTransactionsQuery,
  useUpdateTransactionMutation,
} from '@/store/api/appApi';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function TransactionsScreen() {
  const dispatch = useAppDispatch();
  const { data: transactions = [], isLoading, error, refetch } = useGetTransactionsQuery();
  const { data: accounts = [] } = useGetBankAccountsQuery();
  const { data: customCategories = [] } = useGetCustomCategoriesQuery();

  const [createTransaction, { isLoading: isCreating, error: createError }] =
    useCreateTransactionMutation();
  const [updateTransaction, { isLoading: isUpdating, error: updateError }] =
    useUpdateTransactionMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();

  const mutationLoading = isCreating || isUpdating;
  const mutationError = createError || updateError;

  const [partitionMap, setPartitionMap] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [type, setType] = useState('expense');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [partitionId, setPartitionId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');

  const [partitionsForAccount, setPartitionsForAccount] = useState([]);

  useEffect(() => {
    if (!accounts.length) return;
    Promise.all(
      accounts.map((account) =>
        dispatch(appApi.endpoints.getPartitions.initiate(account.$id))
      )
    ).then((results) => {
      const map = {};
      results.forEach((result) => {
        (result.data ?? []).forEach((partition) => {
          map[partition.$id] = partition.name;
        });
      });
      setPartitionMap(map);
    });
  }, [accounts, dispatch]);

  useEffect(() => {
    if (!bankAccountId) {
      setPartitionsForAccount([]);
      return;
    }
    dispatch(appApi.endpoints.getPartitions.initiate(bankAccountId)).then((result) => {
      setPartitionsForAccount(result.data ?? []);
    });
  }, [bankAccountId, dispatch]);

  const categoriesForType = useMemo(() => {
    const presets = getPresetCategoriesByType(type).map((c) => ({
      id: c.id,
      name: c.name,
    }));
    const customs = customCategories
      .filter((c) => c.type === type)
      .map((c) => ({ id: c.$id, name: c.name }));
    return [...presets, ...customs];
  }, [type, customCategories]);

  const accountOptions = accounts.map((a) => ({ id: a.$id, name: a.name }));
  const partitionOptions = partitionsForAccount.map((p) => ({
    id: p.$id,
    name: p.name,
  }));

  const groupedTransactions = useMemo(
    () => groupByDate(transactions),
    [transactions]
  );

  const resetForm = () => {
    setType('expense');
    setCategoryId('');
    setCategoryName('');
    setBankAccountId('');
    setPartitionId('');
    setAmount('');
    setDate(todayISO());
    setNote('');
  };

  const openCreateModal = () => {
    setEditingTransaction(null);
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setType(transaction.type);
    setCategoryId(transaction.categoryId);
    setCategoryName(transaction.categoryName);
    setBankAccountId(transaction.bankAccountId);
    setPartitionId(transaction.partitionId);
    setAmount(String(transaction.amount));
    setDate(transaction.date);
    setNote(transaction.note || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingTransaction(null);
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategoryId('');
    setCategoryName('');
  };

  const handleSave = async () => {
    if (!categoryId || !bankAccountId || !partitionId || !amount || !date) return;

    const payload = {
      type,
      categoryId,
      categoryName,
      bankAccountId,
      partitionId,
      amount: parseFloat(amount),
      date,
      note,
    };

    try {
      if (editingTransaction) {
        await updateTransaction({ id: editingTransaction.$id, ...payload }).unwrap();
      } else {
        await createTransaction(payload).unwrap();
      }
      closeModal();
    } catch {
      // error in modal
    }
  };

  const handleDelete = (transaction) => {
    Alert.alert('Delete transaction', 'Delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction(transaction.$id).unwrap();
          } catch (err) {
            Alert.alert(
              'Error',
              err?.data || err?.error || 'Failed to delete transaction.'
            );
          }
        },
      },
    ]);
  };

  const getAccountName = (id) => accounts.find((a) => a.$id === id)?.name ?? 'Account';
  const getAccountCurrency = (id) =>
    accounts.find((a) => a.$id === id)?.currency ?? 'USD';

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 pt-6">
        <ScreenHeader
          title="Transactions"
          subtitle={`${transactions.length} recorded · green income, red expenses`}
        />

        {error && !modalVisible ? (
          <Text className="mt-4 text-sm font-medium text-expense-600 dark:text-expense-500">
            {error?.data || error?.error || 'Failed to load transactions'}
          </Text>
        ) : null}

        {isLoading && transactions.length === 0 ? (
          <View className="mt-6 gap-3">
            <ListItemSkeleton />
            <ListItemSkeleton />
            <ListItemSkeleton />
          </View>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            subtitle="Record income and expenses against your partitions"
            actionLabel="Add transaction"
            onAction={openCreateModal}
          />
        ) : (
          <ScrollView
            className="mt-6"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#133458" />
            }>
            <View className="gap-6 pb-24">
              {groupedTransactions.map((group) => (
                <View key={group.date}>
                  <DateGroupHeader label={group.label} count={group.items.length} />
                  <View className="gap-3">
                    {group.items.map((transaction) => (
                      <TransactionRow
                        key={transaction.$id}
                        categoryName={transaction.categoryName}
                        accountName={getAccountName(transaction.bankAccountId)}
                        partitionName={
                          partitionMap[transaction.partitionId] || 'Partition'
                        }
                        amount={transaction.amount}
                        currency={getAccountCurrency(transaction.bankAccountId)}
                        type={transaction.type}
                        note={transaction.note}
                        onPress={() => openEditModal(transaction)}
                        onDelete={() => handleDelete(transaction)}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      <Fab onPress={openCreateModal} label="Add" accessibilityLabel="Add transaction" />

      <ModalSheet
        visible={modalVisible}
        onClose={closeModal}
        title={editingTransaction ? 'Edit transaction' : 'New transaction'}>
        <View className="gap-4">
          <View className="flex-row gap-2">
            <Pressable
              className={`flex-1 rounded-xl border-2 py-3.5 ${
                type === 'income'
                  ? 'border-income-600 bg-income-600'
                  : 'border-border bg-surface-bg dark:border-border-dark dark:bg-surface-dark'
              }`}
              onPress={() => handleTypeChange('income')}
              disabled={mutationLoading}
              accessibilityRole="button"
              accessibilityLabel="Income">
              <Text
                className={`text-center font-bold ${
                  type === 'income' ? 'text-white' : 'text-content-secondary dark:text-gray-300'
                }`}>
                ↑ Income
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 rounded-xl border-2 py-3.5 ${
                type === 'expense'
                  ? 'border-expense-600 bg-expense-600'
                  : 'border-border bg-surface-bg dark:border-border-dark dark:bg-surface-dark'
              }`}
              onPress={() => handleTypeChange('expense')}
              disabled={mutationLoading}
              accessibilityRole="button"
              accessibilityLabel="Expense">
              <Text
                className={`text-center font-bold ${
                  type === 'expense' ? 'text-white' : 'text-content-secondary dark:text-gray-300'
                }`}>
                ↓ Expense
              </Text>
            </Pressable>
          </View>

          <ChipPicker
            label="Category"
            options={categoriesForType}
            value={categoryId}
            onChange={(id, catName) => {
              setCategoryId(id);
              setCategoryName(catName);
            }}
            disabled={mutationLoading}
          />

          <ChipPicker
            label="Bank account"
            options={accountOptions}
            value={bankAccountId}
            onChange={(id) => {
              setBankAccountId(id);
              setPartitionId('');
            }}
            disabled={mutationLoading}
          />

          <ChipPicker
            label="Partition (required)"
            options={partitionOptions}
            value={partitionId}
            onChange={(id) => setPartitionId(id)}
            disabled={mutationLoading || !bankAccountId}
          />

          <FormField
            label="Amount"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            editable={!mutationLoading}
          />

          <DatePickerField
            label="Date"
            value={date}
            onChange={setDate}
            disabled={mutationLoading}
          />

          <FormField
            label="Note (optional)"
            placeholder="Add a note"
            value={note}
            onChangeText={setNote}
            editable={!mutationLoading}
          />

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
              disabled={
                !categoryId ||
                !bankAccountId ||
                !partitionId ||
                !amount ||
                !date
              }
              className="flex-1"
            />
          </View>
        </View>
      </ModalSheet>
    </ScreenContainer>
  );
}
