import { useEffect, useMemo, useState } from 'react';
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
import { ChipPicker } from '@/components/ui/ChipPicker';
import { EmptyState } from '@/components/ui/EmptyState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { getPresetCategoriesByType } from '@/constants/presetCategories';
import { formatCurrency } from '@/lib/accounts/formatCurrency';
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
  const { data: transactions = [], isLoading, error } = useGetTransactionsQuery();
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

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 pt-6">
        <ScreenHeader
          title="Transactions"
          subtitle="Track income and expenses by partition"
          action={
            <PrimaryButton
              label="+ Add"
              onPress={openCreateModal}
              className="px-4 py-2"
            />
          }
        />

        {error && !modalVisible ? (
          <Text className="mt-4 text-sm text-red-500">
            {error?.data || error?.error || 'Failed to load transactions'}
          </Text>
        ) : null}

        {isLoading && transactions.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            subtitle="Record income and expenses against your partitions"
            actionLabel="Add transaction"
            onAction={openCreateModal}
          />
        ) : (
          <ScrollView className="mt-6" showsVerticalScrollIndicator={false}>
            <View className="gap-3">
              {transactions.map((transaction) => {
                const currency = getAccountCurrency(transaction.bankAccountId);
                const isIncome = transaction.type === 'income';
                return (
                  <Card key={transaction.$id}>
                    <Pressable onPress={() => openEditModal(transaction)}>
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                          <View className="flex-row items-center gap-2">
                            <View
                              className={`rounded-full px-2 py-0.5 ${
                                isIncome
                                  ? 'bg-income-50 dark:bg-income-500/10'
                                  : 'bg-expense-50 dark:bg-expense-500/10'
                              }`}>
                              <Text
                                className={`text-xs font-semibold uppercase ${
                                  isIncome ? 'text-income-600' : 'text-expense-600'
                                }`}>
                                {transaction.type}
                              </Text>
                            </View>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                              {transaction.date}
                            </Text>
                          </View>
                          <Text className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                            {transaction.categoryName}
                          </Text>
                          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {getAccountName(transaction.bankAccountId)} ·{' '}
                            {partitionMap[transaction.partitionId] || 'Partition'}
                          </Text>
                          {transaction.note ? (
                            <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {transaction.note}
                            </Text>
                          ) : null}
                        </View>
                        <Text
                          className={`text-lg font-bold ${
                            isIncome ? 'text-income-600' : 'text-expense-600'
                          }`}>
                          {isIncome ? '+' : '-'}
                          {formatCurrency(transaction.amount, currency)}
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable className="mt-3 self-end" onPress={() => handleDelete(transaction)}>
                      <Text className="text-sm font-medium text-expense-500">Delete</Text>
                    </Pressable>
                  </Card>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <ScrollView className="max-h-[90%] rounded-t-3xl bg-white dark:bg-gray-900">
            <View className="p-6">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                {editingTransaction ? 'Edit transaction' : 'New transaction'}
              </Text>

              <View className="mt-6 gap-4">
                <View className="flex-row gap-2">
                  <Pressable
                    className={`flex-1 rounded-xl py-3 ${
                      type === 'income' ? 'bg-income-600' : 'bg-gray-200 dark:bg-gray-800'
                    }`}
                    onPress={() => handleTypeChange('income')}
                    disabled={mutationLoading}>
                    <Text
                      className={`text-center font-semibold ${
                        type === 'income' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      Income
                    </Text>
                  </Pressable>
                  <Pressable
                    className={`flex-1 rounded-xl py-3 ${
                      type === 'expense' ? 'bg-expense-600' : 'bg-gray-200 dark:bg-gray-800'
                    }`}
                    onPress={() => handleTypeChange('expense')}
                    disabled={mutationLoading}>
                    <Text
                      className={`text-center font-semibold ${
                        type === 'expense' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      Expense
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

                <View>
                  <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount
                  </Text>
                  <TextInput
                    className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={setAmount}
                    editable={!mutationLoading}
                  />
                </View>

                <View>
                  <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </Text>
                  <TextInput
                    className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9ca3af"
                    value={date}
                    onChangeText={setDate}
                    editable={!mutationLoading}
                  />
                </View>

                <View>
                  <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Note (optional)
                  </Text>
                  <TextInput
                    className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Add a note"
                    placeholderTextColor="#9ca3af"
                    value={note}
                    onChangeText={setNote}
                    editable={!mutationLoading}
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
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
