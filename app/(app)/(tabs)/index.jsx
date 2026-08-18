import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { AnalyticsSummary } from '@/components/dashboard/AnalyticsSummary';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { CurrencyFilter } from '@/components/dashboard/CurrencyFilter';
import { MonthPicker } from '@/components/dashboard/MonthPicker';
import { PartitionPieChart } from '@/components/dashboard/PartitionPieChart';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  appApi,
  useGetBankAccountsQuery,
  useGetTransactionsQuery,
} from '@/store/api/appApi';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { data: transactions = [], isLoading: transactionsLoading } =
    useGetTransactionsQuery();
  const { data: accounts = [], isLoading: accountsLoading } = useGetBankAccountsQuery();

  const [monthState, setMonthState] = useState(getCurrentMonth);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [partitionsByAccount, setPartitionsByAccount] = useState({});

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

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Dashboard"
          subtitle={`Welcome back, ${user?.name || user?.email || 'there'}`}
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
          <View className="mt-12 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <>
            {selectedCurrency ? (
              <AnalyticsSummary
                totals={totals}
                balance={balance}
                currency={selectedCurrency}
              />
            ) : null}

            {!hasMonthData ? (
              <View className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
                <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
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
