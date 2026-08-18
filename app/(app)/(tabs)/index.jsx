import { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

import {
  AnalyticsSummary,
  HeroBalanceCard,
} from '@/components/dashboard/AnalyticsSummary';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { CurrencyFilter } from '@/components/dashboard/CurrencyFilter';
import { MonthPicker } from '@/components/dashboard/MonthPicker';
import { PartitionPieChart } from '@/components/dashboard/PartitionPieChart';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { getCurrentMonth, formatMonthLabel } from '@/lib/analytics/dateRange';
import { buildPartitionChartData } from '@/lib/analytics/partitions';
import {
  filterTransactionsByCurrency,
  filterTransactionsByMonth,
  getAccountBalanceForCurrency,
  getUniqueCurrencies,
  sumByCategory,
  sumByType,
} from '@/lib/analytics/transactions';
import { getGreeting } from '@/lib/ui/greeting';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  appApi,
  useGetBankAccountsQuery,
  useGetTransactionsQuery,
} from '@/store/api/appApi';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { data: transactions = [], isLoading: transactionsLoading, refetch: refetchTransactions } =
    useGetTransactionsQuery();
  const { data: accounts = [], isLoading: accountsLoading, refetch: refetchAccounts } =
    useGetBankAccountsQuery();

  const [monthState, setMonthState] = useState(getCurrentMonth);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [partitionsByAccount, setPartitionsByAccount] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const currencies = useMemo(() => getUniqueCurrencies(accounts), [accounts]);

  useEffect(() => {
    if (currencies.length && !selectedCurrency) {
      setSelectedCurrency(currencies[0]);
    }
  }, [currencies, selectedCurrency]);

  useEffect(() => {
    if (accounts.length && !selectedAccountId) {
      setSelectedAccountId(accounts[0].$id);
    }
  }, [accounts, selectedAccountId]);

  useEffect(() => {
    if (!accounts.length) return;

    Promise.all(
      accounts.map((account) =>
        dispatch(appApi.endpoints.getPartitions.initiate(account.$id))
      )
    ).then((results) => {
      const map = {};
      results.forEach((result, index) => {
        map[accounts[index].$id] = result.data ?? [];
      });
      setPartitionsByAccount(map);
    });
  }, [accounts, dispatch]);

  const monthTransactions = useMemo(
    () =>
      filterTransactionsByMonth(
        transactions,
        monthState.year,
        monthState.month
      ),
    [transactions, monthState]
  );

  const currencyTransactions = useMemo(
    () =>
      filterTransactionsByCurrency(
        monthTransactions,
        selectedCurrency,
        accounts
      ),
    [monthTransactions, selectedCurrency, accounts]
  );

  const totals = useMemo(
    () => sumByType(currencyTransactions),
    [currencyTransactions]
  );

  const incomeData = useMemo(
    () => sumByCategory(currencyTransactions, 'income'),
    [currencyTransactions]
  );

  const expenseData = useMemo(
    () => sumByCategory(currencyTransactions, 'expense'),
    [currencyTransactions]
  );

  const selectedAccount = accounts.find((account) => account.$id === selectedAccountId);
  const partitionData = useMemo(
    () =>
      buildPartitionChartData(
        selectedAccount,
        partitionsByAccount[selectedAccountId] ?? []
      ),
    [selectedAccount, partitionsByAccount, selectedAccountId]
  );

  const balance = useMemo(
    () => getAccountBalanceForCurrency(accounts, selectedCurrency),
    [accounts, selectedCurrency]
  );

  const accountsForCurrency = accounts.filter(
    (account) => account.currency === selectedCurrency
  );

  useEffect(() => {
    if (!accountsForCurrency.length) return;
    const stillValid = accountsForCurrency.some(
      (account) => account.$id === selectedAccountId
    );
    if (!stillValid) {
      setSelectedAccountId(accountsForCurrency[0].$id);
    }
  }, [accountsForCurrency, selectedAccountId]);

  const isLoading = transactionsLoading || accountsLoading;
  const monthLabel = formatMonthLabel(monthState.year, monthState.month);
  const hasMonthData = currencyTransactions.length > 0;
  const displayName = user?.name || user?.email?.split('@')[0] || 'there';

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTransactions(), refetchAccounts()]);
    setRefreshing(false);
  };

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#133458" />
        }>
        <ScreenHeader
          greeting={getGreeting()}
          title={displayName}
          subtitle="Here's your financial overview"
        />

        <MonthPicker
          year={monthState.year}
          month={monthState.month}
          onChange={setMonthState}
        />

        <CurrencyFilter
          currencies={currencies}
          value={selectedCurrency}
          onChange={setSelectedCurrency}
        />

        {isLoading ? (
          <View className="mt-4 gap-3">
            <View className="h-24 rounded-2xl bg-primary-50 dark:bg-primary-600/15" />
            <View className="flex-row gap-3">
              <StatCardSkeleton />
              <StatCardSkeleton />
            </View>
          </View>
        ) : (
          <>
            {selectedCurrency ? (
              <>
                <HeroBalanceCard balance={balance} currency={selectedCurrency} />
                <AnalyticsSummary
                  totals={totals}
                  balance={balance}
                  currency={selectedCurrency}
                />
              </>
            ) : null}

            {!hasMonthData ? (
              <View className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-6 dark:border-border-dark dark:bg-surface-card">
                <Text className="text-center text-sm text-content-secondary dark:text-gray-400">
                  No transactions in {monthLabel}
                  {selectedCurrency ? ` for ${selectedCurrency}` : ''}
                </Text>
              </View>
            ) : null}

            <CategoryPieChart
              title="Income by category"
              data={incomeData}
              currency={selectedCurrency}
              emptyMessage="No income this month"
            />

            <CategoryPieChart
              title="Expense by category"
              data={expenseData}
              currency={selectedCurrency}
              emptyMessage="No expenses this month"
            />

            <PartitionPieChart
              accounts={accountsForCurrency}
              selectedAccountId={selectedAccountId}
              onSelectAccount={setSelectedAccountId}
              data={partitionData}
              currency={selectedAccount?.currency ?? selectedCurrency}
            />

            <View className="h-8" />
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
