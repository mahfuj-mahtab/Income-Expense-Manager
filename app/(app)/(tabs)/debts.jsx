import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { DebtCard } from '@/components/debts/DebtCard';
import { ChipPicker } from '@/components/ui/ChipPicker';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { DateGroupHeader } from '@/components/ui/ScreenDecor';
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
import { formatCurrency } from '@/lib/accounts/formatCurrency';
import { outstandingAmount } from '@/lib/debts/balance';
import { groupByDate } from '@/lib/ui/groupByDate';
import { todayLocalDate } from '@/lib/ui/localDate';
import {
  appApi,
  useCreateDebtMutation,
  useDeleteDebtMutation,
  useGetBankAccountsQuery,
  useGetDebtRepaymentsQuery,
  useGetDebtsQuery,
  useRepayDebtMutation,
} from '@/store/api/appApi';
import { useAppDispatch } from '@/store/hooks';

export default function DebtsScreen() {
  const dispatch = useAppDispatch();
  const { data: debts = [], isLoading, error, refetch } = useGetDebtsQuery();
  const { data: repayments = [], refetch: refetchRepayments } = useGetDebtRepaymentsQuery();
  const { data: accounts = [] } = useGetBankAccountsQuery();

  const [createDebt, { isLoading: isCreating, error: createError }] = useCreateDebtMutation();
  const [repayDebt, { isLoading: isRepaying, error: repayError }] = useRepayDebtMutation();
  const [deleteDebt] = useDeleteDebtMutation();

  const [partitionMap, setPartitionMap] = useState({});
  const [partitionsForAccount, setPartitionsForAccount] = useState([]);
  const [createVisible, setCreateVisible] = useState(false);
  const [repayTarget, setRepayTarget] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [person, setPerson] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [partitionId, setPartitionId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayLocalDate());
  const [note, setNote] = useState('');

  const [repayAmount, setRepayAmount] = useState('');
  const [repayDate, setRepayDate] = useState(todayLocalDate());
  const [repayNote, setRepayNote] = useState('');

  const accountKey = useMemo(() => accounts.map((account) => account.$id).join('|'), [accounts]);
  const debtStamp = useMemo(
    () => debts.map((debt) => `${debt.$id}:${debt.repaidAmount}:${debt.status}`).join('|'),
    [debts]
  );

  useEffect(() => {
    if (!accountKey) return;
    let active = true;
    Promise.all(
      accountKey.split('|').map((id) =>
        dispatch(
          appApi.endpoints.getPartitions.initiate(id, {
            subscribe: false,
            forceRefetch: true,
          })
        )
      )
    ).then((results) => {
      if (!active) return;
      const map = {};
      results.forEach((result) => {
        (result.data ?? []).forEach((partition) => {
          map[partition.$id] = partition;
        });
      });
      setPartitionMap(map);
    });
    return () => {
      active = false;
    };
  }, [accountKey, debtStamp, dispatch]);

  useEffect(() => {
    if (!bankAccountId) {
      setPartitionsForAccount([]);
      return;
    }
    const request = dispatch(
      appApi.endpoints.getPartitions.initiate(bankAccountId, { subscribe: false })
    );
    request.then((result) => {
      setPartitionsForAccount(result.data ?? []);
    });
  }, [bankAccountId, dispatch]);

  const accountOptions = accounts.map((account) => ({ id: account.$id, name: account.name }));
  const selectedAccount = accounts.find((account) => account.$id === bankAccountId);
  const partitionOptions = partitionsForAccount.map((partition) => ({
    id: partition.$id,
    name: `${partition.name} · ${formatCurrency(
      partition.balance,
      selectedAccount?.currency
    )}`,
  }));

  const groupedDebts = useMemo(() => groupByDate(debts), [debts]);
  const repaymentsByDebt = useMemo(() => {
    const map = {};
    repayments.forEach((repayment) => {
      if (!map[repayment.debtId]) map[repayment.debtId] = [];
      map[repayment.debtId].push(repayment);
    });
    return map;
  }, [repayments]);

  const resetCreateForm = () => {
    setPerson('');
    setBankAccountId('');
    setPartitionId('');
    setAmount('');
    setDate(todayLocalDate());
    setNote('');
  };

  const openCreate = () => {
    resetCreateForm();
    setCreateVisible(true);
  };

  const openRepay = (debt) => {
    const outstanding = outstandingAmount(debt.amount, debt.repaidAmount);
    setRepayTarget(debt);
    setRepayAmount(String(outstanding));
    setRepayDate(todayLocalDate());
    setRepayNote('');
  };

  const getAccountName = (id) => accounts.find((account) => account.$id === id)?.name ?? 'Account';
  const getAccountCurrency = (id) =>
    accounts.find((account) => account.$id === id)?.currency ?? 'USD';
  const getPartitionName = (id) => partitionMap[id]?.name || 'Partition';

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchRepayments()]);
    setRefreshing(false);
  };

  const handleCreate = async () => {
    if (!person.trim() || !bankAccountId || !partitionId || !amount || !date) return;

    try {
      await createDebt({
        person,
        bankAccountId,
        partitionId,
        amount: parseFloat(amount),
        date,
        note,
      }).unwrap();
      setCreateVisible(false);
    } catch {
      // error shown in the modal
    }
  };

  const handleRepay = async () => {
    if (!repayTarget || !repayAmount || !repayDate) return;

    try {
      await repayDebt({
        debtId: repayTarget.$id,
        amount: parseFloat(repayAmount),
        date: repayDate,
        note: repayNote,
      }).unwrap();
      setRepayTarget(null);
    } catch {
      // error shown in the modal
    }
  };

  const handleDelete = (debt) => {
    const outstanding = outstandingAmount(debt.amount, debt.repaidAmount);
    const partitionName = getPartitionName(debt.partitionId);
    const message =
      outstanding > 0
        ? `The remaining ${formatCurrency(outstanding, getAccountCurrency(debt.bankAccountId))} returns only to ${partitionName}.`
        : 'Delete this repaid debt?';

    Alert.alert('Delete debt', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDebt(debt.$id).unwrap();
          } catch (err) {
            Alert.alert('Error', err?.data || err?.error || 'Failed to delete debt.');
          }
        },
      },
    ]);
  };

  const repayPartitionName = repayTarget ? getPartitionName(repayTarget.partitionId) : '';
  const repayAccountName = repayTarget ? getAccountName(repayTarget.bankAccountId) : '';

  return (
    <ScreenContainer>
      <ScreenEnter fill>
      <View className="flex-1 px-6 pt-6">
        <ScreenHeader
          title="Debts"
          subtitle="Money lent from a partition. Repayment returns only to that partition."
        />

        {error && !createVisible && !repayTarget ? (
          <Text className="mt-4 text-sm font-medium text-expense-600 dark:text-expense-500">
            {error?.data || error?.error || 'Failed to load debts'}
          </Text>
        ) : null}

        {isLoading && debts.length === 0 ? (
          <View className="mt-6 gap-3">
            <ListItemSkeleton />
            <ListItemSkeleton />
            <ListItemSkeleton />
          </View>
        ) : debts.length === 0 ? (
          <EmptyState
            title="No debts yet"
            subtitle="Record money that left a partition and pay it back into that same partition"
            actionLabel="Add debt"
            onAction={openCreate}
          />
        ) : (
          <ScrollView
            className="mt-6"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#133458" />
            }>
            <View className="gap-6 pb-24">
              {groupedDebts.map((group) => (
                <View key={group.date}>
                  <DateGroupHeader label={group.label} count={group.items.length} />
                  <View className="gap-3">
                    {group.items.map((debt) => (
                      <DebtCard
                        key={debt.$id}
                        debt={debt}
                        accountName={getAccountName(debt.bankAccountId)}
                        partitionName={getPartitionName(debt.partitionId)}
                        currency={getAccountCurrency(debt.bankAccountId)}
                        repayments={repaymentsByDebt[debt.$id] ?? []}
                        onRepay={() => openRepay(debt)}
                        onDelete={() => handleDelete(debt)}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
      </ScreenEnter>

      <Fab onPress={openCreate} label="Add" accessibilityLabel="Add debt" />

      <ModalSheet visible={createVisible} onClose={() => setCreateVisible(false)} title="New debt">
        <View className="gap-4">
          <FormField
            label="Person"
            placeholder="Who received the money"
            value={person}
            onChangeText={setPerson}
            editable={!isCreating}
          />

          <ChipPicker
            label="Bank account"
            options={accountOptions}
            value={bankAccountId}
            onChange={(id) => {
              setBankAccountId(id);
              setPartitionId('');
            }}
            disabled={isCreating}
          />

          <ChipPicker
            label="Partition the money leaves"
            options={partitionOptions}
            value={partitionId}
            onChange={(id) => setPartitionId(id)}
            disabled={isCreating || !bankAccountId}
          />

          <FormField
            label="Amount"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            editable={!isCreating}
          />

          <DatePickerField
            label="Date"
            value={date}
            onChange={setDate}
            disabled={isCreating}
          />

          <FormField
            label="Note (optional)"
            placeholder="Add a note"
            value={note}
            onChangeText={setNote}
            editable={!isCreating}
          />

          {createError ? (
            <Text className="text-sm font-medium text-expense-600 dark:text-expense-500">
              {createError?.data || createError?.error || 'Something went wrong'}
            </Text>
          ) : null}

          <View className="flex-row gap-3">
            <SecondaryButton
              label="Cancel"
              onPress={() => setCreateVisible(false)}
              disabled={isCreating}
              className="flex-1"
            />
            <PrimaryButton
              label="Save"
              onPress={handleCreate}
              loading={isCreating}
              disabled={!person.trim() || !bankAccountId || !partitionId || !amount || !date}
              className="flex-1"
            />
          </View>
        </View>
      </ModalSheet>

      <ModalSheet
        visible={Boolean(repayTarget)}
        onClose={() => setRepayTarget(null)}
        title="Repay debt">
        <View className="gap-4">
          <Text className="text-sm text-content-secondary dark:text-gray-300">
            This repayment is added only to {repayPartitionName} on {repayAccountName}.
          </Text>

          <FormField
            label="Amount"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={repayAmount}
            onChangeText={setRepayAmount}
            editable={!isRepaying}
          />

          <DatePickerField
            label="Date"
            value={repayDate}
            onChange={setRepayDate}
            disabled={isRepaying}
          />

          <FormField
            label="Note (optional)"
            placeholder="Add a note"
            value={repayNote}
            onChangeText={setRepayNote}
            editable={!isRepaying}
          />

          {repayError ? (
            <Text className="text-sm font-medium text-expense-600 dark:text-expense-500">
              {repayError?.data || repayError?.error || 'Something went wrong'}
            </Text>
          ) : null}

          <View className="flex-row gap-3">
            <SecondaryButton
              label="Cancel"
              onPress={() => setRepayTarget(null)}
              disabled={isRepaying}
              className="flex-1"
            />
            <PrimaryButton
              label="Repay"
              onPress={handleRepay}
              loading={isRepaying}
              disabled={!repayAmount || !repayDate}
              className="flex-1"
            />
          </View>
        </View>
      </ModalSheet>
    </ScreenContainer>
  );
}
