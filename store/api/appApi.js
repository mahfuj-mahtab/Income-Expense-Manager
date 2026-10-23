import { canAllocate, getPartitionsTotal } from '@/lib/accounts/validation';
import {
    account,
    APPWRITE_DATABASE_ID,
    BANK_ACCOUNTS_TABLE_ID,
    CATEGORIES_TABLE_ID,
    DEBT_REPAYMENTS_TABLE_ID,
    DEBTS_TABLE_ID,
    PARTITIONS_TABLE_ID,
    tablesDB,
    TRANSACTIONS_TABLE_ID,
} from '@/lib/appwrite/client';
import {
    canRepayDebt,
    canTakeDebt,
    debtStatus,
    outstandingAmount,
    roundMoney,
} from '@/lib/debts/balance';
import { normalizeDateKey } from '@/lib/ui/localDate';
import {
    validateExpense,
} from '@/lib/transactions/balance';
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { ID, Permission, Query, Role } from 'react-native-appwrite';

function getErrorMessage(error) {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

function queryError(message) {
  return { error: { status: 400, data: message } };
}

async function getCurrentUser() {
  return await account.get();
}

function userPermissions(userId) {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

async function applyBalanceDelta({ bankAccountId, partitionId, type, amount }) {
  const value = Number(amount);
  if (type === 'income') {
    await tablesDB.incrementRowColumn({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: PARTITIONS_TABLE_ID,
      rowId: partitionId,
      column: 'balance',
      value,
    });
    await tablesDB.incrementRowColumn({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: BANK_ACCOUNTS_TABLE_ID,
      rowId: bankAccountId,
      column: 'balance',
      value,
    });
  } else {
    await tablesDB.decrementRowColumn({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: PARTITIONS_TABLE_ID,
      rowId: partitionId,
      column: 'balance',
      value,
      min: 0,
    });
    await tablesDB.decrementRowColumn({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: BANK_ACCOUNTS_TABLE_ID,
      rowId: bankAccountId,
      column: 'balance',
      value,
      min: 0,
    });
  }
}

async function reverseBalanceDelta({ bankAccountId, partitionId, type, amount }) {
  const value = Number(amount);
  if (type === 'income') {
    await tablesDB.decrementRowColumn({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: PARTITIONS_TABLE_ID,
      rowId: partitionId,
      column: 'balance',
      value,
      min: 0,
    });
    await tablesDB.decrementRowColumn({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: BANK_ACCOUNTS_TABLE_ID,
      rowId: bankAccountId,
      column: 'balance',
      value,
      min: 0,
    });
  } else {
    await tablesDB.incrementRowColumn({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: PARTITIONS_TABLE_ID,
      rowId: partitionId,
      column: 'balance',
      value,
    });
    await tablesDB.incrementRowColumn({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: BANK_ACCOUNTS_TABLE_ID,
      rowId: bankAccountId,
      column: 'balance',
      value,
    });
  }
}

export const appApi = createApi({
  reducerPath: 'appApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['BankAccount', 'Partition', 'Category', 'Transaction', 'Debt', 'DebtRepayment'],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    getBankAccounts: builder.query({
      async queryFn() {
        try {
          const user = await getCurrentUser();
          const response = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: BANK_ACCOUNTS_TABLE_ID,
            queries: [Query.equal('userId', user.$id)],
          });
          return { data: response.rows };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      providesTags: ['BankAccount'],
    }),

    createBankAccount: builder.mutation({
      async queryFn({ name, balance, currency }) {
        try {
          const user = await getCurrentUser();
          const row = await tablesDB.createRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: BANK_ACCOUNTS_TABLE_ID,
            rowId: ID.unique(),
            data: {
              userId: user.$id,
              name: name.trim(),
              balance: Number(balance),
              currency,
            },
            permissions: userPermissions(user.$id),
          });
          return { data: row };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: ['BankAccount'],
    }),

    updateBankAccount: builder.mutation({
      async queryFn({ id, name, balance, currency }) {
        try {
          const user = await getCurrentUser();
          const partitionsResponse = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: PARTITIONS_TABLE_ID,
            queries: [
              Query.equal('bankAccountId', id),
              Query.equal('userId', user.$id),
            ],
          });

          const partitionsTotal = getPartitionsTotal(partitionsResponse.rows);
          if (Number(balance) < partitionsTotal) {
            return queryError(
              'Balance cannot be less than the total allocated to partitions.'
            );
          }

          const row = await tablesDB.updateRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: BANK_ACCOUNTS_TABLE_ID,
            rowId: id,
            data: {
              name: name.trim(),
              balance: Number(balance),
              currency,
            },
          });
          return { data: row };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: ['BankAccount'],
    }),

    deleteBankAccount: builder.mutation({
      async queryFn(id) {
        try {
          const user = await getCurrentUser();
          const partitionsResponse = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: PARTITIONS_TABLE_ID,
            queries: [
              Query.equal('bankAccountId', id),
              Query.equal('userId', user.$id),
            ],
          });

          if (partitionsResponse.rows.length > 0) {
            return queryError('Delete all partitions before deleting this account.');
          }

          const transactionsResponse = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TRANSACTIONS_TABLE_ID,
            queries: [
              Query.equal('bankAccountId', id),
              Query.equal('userId', user.$id),
              Query.limit(1),
            ],
          });

          if (transactionsResponse.rows.length > 0) {
            return queryError('Delete all transactions before deleting this account.');
          }

          await tablesDB.deleteRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: BANK_ACCOUNTS_TABLE_ID,
            rowId: id,
          });
          return { data: id };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: ['BankAccount'],
    }),

    getPartitions: builder.query({
      async queryFn(bankAccountId) {
        try {
          const user = await getCurrentUser();
          const response = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: PARTITIONS_TABLE_ID,
            queries: [
              Query.equal('bankAccountId', bankAccountId),
              Query.equal('userId', user.$id),
            ],
          });
          return { data: response.rows };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      providesTags: (result, error, bankAccountId) => [
        { type: 'Partition', id: bankAccountId },
      ],
    }),

    createPartition: builder.mutation({
      async queryFn({ bankAccountId, name, balance }) {
        try {
          const user = await getCurrentUser();
          const accountRow = await tablesDB.getRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: BANK_ACCOUNTS_TABLE_ID,
            rowId: bankAccountId,
          });

          const partitionsResponse = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: PARTITIONS_TABLE_ID,
            queries: [
              Query.equal('bankAccountId', bankAccountId),
              Query.equal('userId', user.$id),
            ],
          });

          if (!canAllocate(accountRow.balance, partitionsResponse.rows, balance)) {
            return queryError('Partition total would exceed account balance.');
          }

          const row = await tablesDB.createRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: PARTITIONS_TABLE_ID,
            rowId: ID.unique(),
            data: {
              userId: user.$id,
              bankAccountId,
              name: name.trim(),
              balance: Number(balance),
            },
            permissions: userPermissions(user.$id),
          });
          return { data: row };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: (result, error, { bankAccountId }) => [
        { type: 'Partition', id: bankAccountId },
        'BankAccount',
      ],
    }),

    updatePartition: builder.mutation({
      async queryFn({ id, bankAccountId, name, balance }) {
        try {
          const user = await getCurrentUser();
          const accountRow = await tablesDB.getRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: BANK_ACCOUNTS_TABLE_ID,
            rowId: bankAccountId,
          });

          const partitionsResponse = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: PARTITIONS_TABLE_ID,
            queries: [
              Query.equal('bankAccountId', bankAccountId),
              Query.equal('userId', user.$id),
            ],
          });

          if (!canAllocate(accountRow.balance, partitionsResponse.rows, balance, id)) {
            return queryError('Partition total would exceed account balance.');
          }

          const row = await tablesDB.updateRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: PARTITIONS_TABLE_ID,
            rowId: id,
            data: {
              name: name.trim(),
              balance: Number(balance),
            },
          });
          return { data: row };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: (result, error, { bankAccountId }) => [
        { type: 'Partition', id: bankAccountId },
        'BankAccount',
      ],
    }),

    deletePartition: builder.mutation({
      async queryFn({ id, bankAccountId }) {
        try {
          const user = await getCurrentUser();
          const transactionsResponse = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TRANSACTIONS_TABLE_ID,
            queries: [
              Query.equal('partitionId', id),
              Query.equal('userId', user.$id),
              Query.limit(1),
            ],
          });

          if (transactionsResponse.rows.length > 0) {
            return queryError('Delete all transactions using this partition first.');
          }

          const debtsResponse = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: DEBTS_TABLE_ID,
            queries: [
              Query.equal('partitionId', id),
              Query.equal('userId', user.$id),
              Query.limit(1),
            ],
          });

          if (debtsResponse.rows.length > 0) {
            return queryError('Delete all debts using this partition first.');
          }

          await tablesDB.deleteRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: PARTITIONS_TABLE_ID,
            rowId: id,
          });
          return { data: { id, bankAccountId } };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: (result, error, { bankAccountId }) => [
        { type: 'Partition', id: bankAccountId },
        'BankAccount',
      ],
    }),

    getCustomCategories: builder.query({
      async queryFn() {
        try {
          const user = await getCurrentUser();
          const response = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: CATEGORIES_TABLE_ID,
            queries: [Query.equal('userId', user.$id)],
          });
          return { data: response.rows };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      providesTags: ['Category'],
    }),

    createCategory: builder.mutation({
      async queryFn({ name, type }) {
        try {
          const user = await getCurrentUser();
          const row = await tablesDB.createRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: CATEGORIES_TABLE_ID,
            rowId: ID.unique(),
            data: {
              userId: user.$id,
              name: name.trim(),
              type,
            },
            permissions: userPermissions(user.$id),
          });
          return { data: row };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: ['Category'],
    }),

    updateCategory: builder.mutation({
      async queryFn({ id, name, type }) {
        try {
          const row = await tablesDB.updateRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: CATEGORIES_TABLE_ID,
            rowId: id,
            data: {
              name: name.trim(),
              type,
            },
          });
          return { data: row };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: ['Category'],
    }),

    deleteCategory: builder.mutation({
      async queryFn(id) {
        try {
          const user = await getCurrentUser();
          const transactionsResponse = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TRANSACTIONS_TABLE_ID,
            queries: [
              Query.equal('categoryId', id),
              Query.equal('userId', user.$id),
              Query.limit(1),
            ],
          });

          if (transactionsResponse.rows.length > 0) {
            return queryError('This category is used in transactions and cannot be deleted.');
          }

          await tablesDB.deleteRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: CATEGORIES_TABLE_ID,
            rowId: id,
          });
          return { data: id };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: ['Category'],
    }),

    getTransactions: builder.query({
      async queryFn() {
        try {
          const user = await getCurrentUser();
          const response = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TRANSACTIONS_TABLE_ID,
            queries: [
              Query.equal('userId', user.$id),
              Query.orderDesc('date'),
            ],
          });
          return { data: response.rows };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      providesTags: ['Transaction'],
    }),

    createTransaction: builder.mutation({
      async queryFn({
        type,
        categoryId,
        categoryName,
        bankAccountId,
        partitionId,
        amount,
        note,
        date,
      }) {
        try {
          const user = await getCurrentUser();
          const partitionRow = await tablesDB.getRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: PARTITIONS_TABLE_ID,
            rowId: partitionId,
          });

          if (type === 'expense' && !validateExpense(partitionRow.balance, amount)) {
            return queryError('Insufficient partition balance for this expense.');
          }

          if (!normalizeDateKey(date)) {
            return queryError('Choose a valid date.');
          }

          const row = await tablesDB.createRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TRANSACTIONS_TABLE_ID,
            rowId: ID.unique(),
            data: {
              userId: user.$id,
              type,
              categoryId,
              categoryName,
              bankAccountId,
              partitionId,
              amount: Number(amount),
              note: note?.trim() || '',
              date: normalizeDateKey(date),
            },
            permissions: userPermissions(user.$id),
          });

          await applyBalanceDelta({
            bankAccountId,
            partitionId,
            type,
            amount,
          });

          return { data: row };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: ['Transaction', 'BankAccount', 'Partition'],
    }),

    updateTransaction: builder.mutation({
      async queryFn({
        id,
        type,
        categoryId,
        categoryName,
        bankAccountId,
        partitionId,
        amount,
        note,
        date,
      }) {
        try {
          const existing = await tablesDB.getRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TRANSACTIONS_TABLE_ID,
            rowId: id,
          });

          await reverseBalanceDelta({
            bankAccountId: existing.bankAccountId,
            partitionId: existing.partitionId,
            type: existing.type,
            amount: existing.amount,
          });

          const partitionRow = await tablesDB.getRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: PARTITIONS_TABLE_ID,
            rowId: partitionId,
          });

          if (type === 'expense' && !validateExpense(partitionRow.balance, amount)) {
            await applyBalanceDelta({
              bankAccountId: existing.bankAccountId,
              partitionId: existing.partitionId,
              type: existing.type,
              amount: existing.amount,
            });
            return queryError('Insufficient partition balance for this expense.');
          }

          if (!normalizeDateKey(date)) {
            return queryError('Choose a valid date.');
          }

          const row = await tablesDB.updateRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TRANSACTIONS_TABLE_ID,
            rowId: id,
            data: {
              type,
              categoryId,
              categoryName,
              bankAccountId,
              partitionId,
              amount: Number(amount),
              note: note?.trim() || '',
              date: normalizeDateKey(date),
            },
          });

          await applyBalanceDelta({
            bankAccountId,
            partitionId,
            type,
            amount,
          });

          return { data: row };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: ['Transaction', 'BankAccount', 'Partition'],
    }),

    deleteTransaction: builder.mutation({
      async queryFn(id) {
        try {
          const existing = await tablesDB.getRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TRANSACTIONS_TABLE_ID,
            rowId: id,
          });

          await reverseBalanceDelta({
            bankAccountId: existing.bankAccountId,
            partitionId: existing.partitionId,
            type: existing.type,
            amount: existing.amount,
          });

          await tablesDB.deleteRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TRANSACTIONS_TABLE_ID,
            rowId: id,
          });

          return { data: id };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: ['Transaction', 'BankAccount', 'Partition'],
    }),

    getDebts: builder.query({
      async queryFn() {
        try {
          if (!DEBTS_TABLE_ID) {
            return queryError('Debts table is not set up in Appwrite yet.');
          }
          const user = await getCurrentUser();
          const response = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: DEBTS_TABLE_ID,
            queries: [
              Query.equal('userId', user.$id),
              Query.orderDesc('date'),
              Query.limit(100),
            ],
          });
          return { data: response.rows };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      providesTags: ['Debt'],
    }),

    getDebtRepayments: builder.query({
      async queryFn() {
        try {
          if (!DEBT_REPAYMENTS_TABLE_ID) {
            return queryError('Debt repayments table is not set up in Appwrite yet.');
          }
          const user = await getCurrentUser();
          const response = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: DEBT_REPAYMENTS_TABLE_ID,
            queries: [
              Query.equal('userId', user.$id),
              Query.orderDesc('date'),
              Query.limit(100),
            ],
          });
          return { data: response.rows };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      providesTags: ['DebtRepayment'],
    }),

    createDebt: builder.mutation({
      async queryFn({ person, bankAccountId, partitionId, amount, note, date }) {
        try {
          const user = await getCurrentUser();
          const value = roundMoney(amount);
          const dateKey = normalizeDateKey(date);
          const personName = person?.trim() || '';

          if (!personName) {
            return queryError('Enter who this debt is with.');
          }
          if (!dateKey) {
            return queryError('Choose a valid date.');
          }
          if (!(value > 0)) {
            return queryError('Enter an amount greater than zero.');
          }

          const partitionRow = await tablesDB.getRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: PARTITIONS_TABLE_ID,
            rowId: partitionId,
          });

          if (!canTakeDebt(partitionRow.balance, value)) {
            return queryError(
              Number(partitionRow.balance) <= 0
                ? 'Cannot take a debt from a partition with no balance.'
                : 'Debt amount cannot exceed the partition balance.'
            );
          }

          const row = await tablesDB.createRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: DEBTS_TABLE_ID,
            rowId: ID.unique(),
            data: {
              userId: user.$id,
              bankAccountId,
              partitionId,
              person: personName,
              amount: value,
              repaidAmount: 0,
              note: note?.trim() || '',
              date: dateKey,
              status: 'open',
            },
            permissions: userPermissions(user.$id),
          });

          await applyBalanceDelta({
            bankAccountId,
            partitionId,
            type: 'expense',
            amount: value,
          });

          return { data: row };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: ['Debt', 'BankAccount', 'Partition'],
    }),

    repayDebt: builder.mutation({
      async queryFn({ debtId, amount, note, date }) {
        try {
          const user = await getCurrentUser();
          const value = roundMoney(amount);
          const dateKey = normalizeDateKey(date);

          if (!dateKey) {
            return queryError('Choose a valid date.');
          }
          if (!(value > 0)) {
            return queryError('Enter an amount greater than zero.');
          }

          const debt = await tablesDB.getRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: DEBTS_TABLE_ID,
            rowId: debtId,
          });

          const outstanding = outstandingAmount(debt.amount, debt.repaidAmount);
          if (!canRepayDebt(outstanding, value)) {
            return queryError('Repayment cannot exceed the outstanding debt.');
          }

          const repaidAmount = roundMoney(Number(debt.repaidAmount || 0) + value);
          const status = debtStatus(debt.amount, repaidAmount);

          await tablesDB.createRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: DEBT_REPAYMENTS_TABLE_ID,
            rowId: ID.unique(),
            data: {
              userId: user.$id,
              debtId,
              amount: value,
              date: dateKey,
              note: note?.trim() || '',
            },
            permissions: userPermissions(user.$id),
          });

          const row = await tablesDB.updateRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: DEBTS_TABLE_ID,
            rowId: debtId,
            data: {
              repaidAmount,
              status,
            },
          });

          await applyBalanceDelta({
            bankAccountId: debt.bankAccountId,
            partitionId: debt.partitionId,
            type: 'income',
            amount: value,
          });

          return { data: row };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: ['Debt', 'DebtRepayment', 'BankAccount', 'Partition'],
    }),

    deleteDebt: builder.mutation({
      async queryFn(id) {
        try {
          const user = await getCurrentUser();
          const debt = await tablesDB.getRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: DEBTS_TABLE_ID,
            rowId: id,
          });

          const outstanding = outstandingAmount(debt.amount, debt.repaidAmount);

          const repaymentsResponse = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: DEBT_REPAYMENTS_TABLE_ID,
            queries: [
              Query.equal('debtId', id),
              Query.equal('userId', user.$id),
              Query.limit(100),
            ],
          });

          await Promise.all(
            repaymentsResponse.rows.map((repayment) =>
              tablesDB.deleteRow({
                databaseId: APPWRITE_DATABASE_ID,
                tableId: DEBT_REPAYMENTS_TABLE_ID,
                rowId: repayment.$id,
              })
            )
          );

          await tablesDB.deleteRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: DEBTS_TABLE_ID,
            rowId: id,
          });

          if (outstanding > 0) {
            await applyBalanceDelta({
              bankAccountId: debt.bankAccountId,
              partitionId: debt.partitionId,
              type: 'income',
              amount: outstanding,
            });
          }

          return { data: id };
        } catch (error) {
          return { error: { status: 400, data: getErrorMessage(error) } };
        }
      },
      invalidatesTags: ['Debt', 'DebtRepayment', 'BankAccount', 'Partition'],
    }),
  }),
});

export const {
  useGetBankAccountsQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
  useGetPartitionsQuery,
  useCreatePartitionMutation,
  useUpdatePartitionMutation,
  useDeletePartitionMutation,
  useGetCustomCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetDebtsQuery,
  useGetDebtRepaymentsQuery,
  useCreateDebtMutation,
  useRepayDebtMutation,
  useDeleteDebtMutation,
} = appApi;
