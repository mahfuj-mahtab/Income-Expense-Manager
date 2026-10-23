import { Account, Client, TablesDB } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setPlatform('com.expense');

export const account = new Account(client);
export const tablesDB = new TablesDB(client);
export { client };

export const APPWRITE_DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
export const BANK_ACCOUNTS_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_BANK_ACCOUNTS_COLLECTION_ID;
export const PARTITIONS_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_PARTITIONS_COLLECTION_ID;
export const CATEGORIES_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID;
export const TRANSACTIONS_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID;
export const DEBTS_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_DEBTS_COLLECTION_ID;
export const DEBT_REPAYMENTS_TABLE_ID =
  process.env.EXPO_PUBLIC_APPWRITE_DEBT_REPAYMENTS_COLLECTION_ID;
