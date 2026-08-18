import { router } from 'expo-router';
import { useState } from 'react';
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
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { getPresetCategoriesByType } from '@/constants/presetCategories';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCustomCategoriesQuery,
  useUpdateCategoryMutation,
} from '@/store/api/appApi';

function CategorySection({
  title,
  type,
  presets,
  customs,
  onEdit,
  onDelete,
  onAdd,
}) {
  return (
    <Card className="mt-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">{title}</Text>
        <PrimaryButton
          label="+ Custom"
          onPress={() => onAdd(type)}
          className="px-3 py-1.5"
        />
      </View>

      <Text className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-400">
        Presets
      </Text>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {presets.map((cat) => (
          <View
            key={cat.id}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
            <Text className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</Text>
          </View>
        ))}
      </View>

      {customs.length > 0 ? (
        <>
          <Text className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-400">
            Custom
          </Text>
          <View className="mt-2 gap-2">
            {customs.map((cat) => (
              <View
                key={cat.$id}
                className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <Text className="text-base text-gray-900 dark:text-white">{cat.name}</Text>
                <View className="flex-row gap-2">
                  <Pressable
                    className="rounded-lg bg-gray-200 px-3 py-1 dark:bg-gray-700"
                    onPress={() => onEdit(cat)}>
                    <Text className="text-sm text-gray-700 dark:text-gray-300">Edit</Text>
                  </Pressable>
                  <Pressable
                    className="rounded-lg bg-expense-50 px-3 py-1 dark:bg-expense-500/10"
                    onPress={() => onDelete(cat)}>
                    <Text className="text-sm text-expense-600">Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </Card>
  );
}

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const { data: customCategories = [], isLoading, error } = useGetCustomCategoriesQuery();
  const [createCategory, { isLoading: isCreating, error: createError }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating, error: updateError }] =
    useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const mutationLoading = isCreating || isUpdating;
  const mutationError = createError || updateError;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryType, setCategoryType] = useState('expense');
  const [name, setName] = useState('');

  const incomePresets = getPresetCategoriesByType('income');
  const expensePresets = getPresetCategoriesByType('expense');
  const customIncome = customCategories.filter((c) => c.type === 'income');
  const customExpense = customCategories.filter((c) => c.type === 'expense');

  const openAddModal = (type) => {
    setEditingCategory(null);
    setCategoryType(type);
    setName('');
    setModalVisible(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryType(category.type);
    setName(category.name);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.$id,
          name: name.trim(),
          type: categoryType,
        }).unwrap();
      } else {
        await createCategory({ name: name.trim(), type: categoryType }).unwrap();
      }
      closeModal();
    } catch {
      // shown in modal
    }
  };

  const handleDelete = (category) => {
    Alert.alert('Delete category', `Delete "${category.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory(category.$id).unwrap();
          } catch (err) {
            Alert.alert(
              'Error',
              err?.data || err?.error || 'Failed to delete category.'
            );
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    const result = await dispatch(logout());
    if (logout.fulfilled.match(result)) {
      router.replace('/(auth)/login');
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Settings"
          subtitle="Manage categories and your account"
        />

        <Card className="mt-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">Account</Text>
          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Signed in as {user?.name || user?.email}
          </Text>
          <PrimaryButton
            label="Log out"
            onPress={handleLogout}
            loading={authLoading}
            variant="danger"
            className="mt-4"
          />
        </Card>

        {error ? (
          <Text className="mt-4 text-sm text-red-500">
            {error?.data || error?.error || 'Failed to load categories'}
          </Text>
        ) : null}

        {isLoading ? (
          <View className="mt-12 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <>
            <CategorySection
              title="Income categories"
              type="income"
              presets={incomePresets}
              customs={customIncome}
              onAdd={openAddModal}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
            <CategorySection
              title="Expense categories"
              type="expense"
              presets={expensePresets}
              customs={customExpense}
              onAdd={openAddModal}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          </>
        )}

        <View className="h-8" />
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl bg-white p-6 dark:bg-gray-900">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              {editingCategory ? 'Edit category' : 'New category'}
            </Text>
            <Text className="mt-1 text-sm capitalize text-gray-500">{categoryType}</Text>

            <View className="mt-6 gap-4">
              <View>
                <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </Text>
                <TextInput
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Category name"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
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
                  disabled={!name.trim()}
                  className="flex-1"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
