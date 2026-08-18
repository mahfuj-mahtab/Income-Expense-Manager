import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { ID, Permission, Query, Role } from 'react-native-appwrite';
import {
  account,
  APPWRITE_DATABASE_ID,
  BANK_ACCOUNTS_TABLE_ID,
  CATEGORIES_TABLE_ID,
  PARTITIONS_TABLE_ID,
  TRANSACTIONS_TABLE_ID,
  tablesDB,
} from '@/lib/appwrite/client';
import { getPartitionsTotal, canAllocate } from '@/lib/accounts/validation';
import {
  validateExpense,
} from '@/lib/transactions/balance';

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
  tagTypes: ['BankAccount', 'Partition', 'Category', 'Transaction'],
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
              date,
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
              date,
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
} = appApi;
