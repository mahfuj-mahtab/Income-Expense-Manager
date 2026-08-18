import {
  EXPENSE_COLORS,
  INCOME_COLORS,
  pickColor,
} from '@/constants/chartColors';
import { transactionInMonth } from '@/lib/analytics/dateRange';

export function filterTransactionsByMonth(transactions, year, month) {
  return transactions.filter((transaction) =>
    transactionInMonth(transaction, year, month)
  );
}

export function filterTransactionsByCurrency(transactions, currency, accounts) {
  const accountCurrencyMap = Object.fromEntries(
    accounts.map((account) => [account.$id, account.currency])
  );

  return transactions.filter(
    (transaction) => accountCurrencyMap[transaction.bankAccountId] === currency
  );
}

export function sumByType(transactions) {
  return transactions.reduce(
    (totals, transaction) => {
      const amount = Number(transaction.amount) || 0;
      if (transaction.type === 'income') {
        totals.income += amount;
      } else {
        totals.expense += amount;
      }
      totals.net = totals.income - totals.expense;
      return totals;
    },
    { income: 0, expense: 0, net: 0 }
  );
}

export function sumByCategory(transactions, type) {
  const grouped = transactions
    .filter((transaction) => transaction.type === type)
    .reduce((map, transaction) => {
      const label = transaction.categoryName || 'Uncategorized';
      map[label] = (map[label] || 0) + (Number(transaction.amount) || 0);
      return map;
    }, {});

  const colors = type === 'income' ? INCOME_COLORS : EXPENSE_COLORS;

  return Object.entries(grouped)
    .map(([label, value], index) => ({
      label,
      value,
      color: pickColor(colors, index),
    }))
    .sort((a, b) => b.value - a.value);
}

export function getAccountBalanceForCurrency(accounts, currency) {
  return accounts
    .filter((account) => account.currency === currency)
    .reduce((total, account) => total + (Number(account.balance) || 0), 0);
}

export function getUniqueCurrencies(accounts) {
  const codes = [...new Set(accounts.map((account) => account.currency))];
  return codes.filter(Boolean);
}
