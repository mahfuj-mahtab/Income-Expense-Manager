import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { FormField } from '@/components/ui/FormField';
import { IconButton } from '@/components/ui/IconButton';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { getPresetCategoriesByType } from '@/constants/presetCategories';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import {
  applyThemePreference,
  persistThemePreference,
  setThemePreference,
} from '@/store/slices/themeSlice';
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCustomCategoriesQuery,
  useUpdateCategoryMutation,
} from '@/store/api/appApi';

const THEME_OPTIONS = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

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
        <Text className="text-lg font-semibold text-content dark:text-white">{title}</Text>
        <PrimaryButton
          label="+ Custom"
          onPress={() => onAdd(type)}
          className="px-3 py-1.5"
        />
      </View>

      <SectionHeader title="Presets" className="mt-4" />
      <View className="flex-row flex-wrap gap-2">
        {presets.map((cat) => (
          <View
            key={cat.id}
            className="rounded-full border border-border bg-surface-bg px-3 py-2 dark:border-border-dark dark:bg-surface-dark">
            <Text className="text-sm text-content-secondary dark:text-gray-300">{cat.name}</Text>
          </View>
        ))}
      </View>

      {customs.length > 0 ? (
        <>
          <SectionHeader title="Custom" className="mt-4" />
          <View className="gap-2">
            {customs.map((cat) => (
              <View
                key={cat.$id}
                className="flex-row items-center justify-between rounded-xl border border-border bg-surface-bg p-3 dark:border-border-dark dark:bg-surface-dark">
                <Text className="text-base text-content dark:text-white">{cat.name}</Text>
                <View className="flex-row gap-2">
                  <IconButton
                    icon="pencil"
                    onPress={() => onEdit(cat)}
                    accessibilityLabel="Edit category"
                    size={36}
                  />
                  <IconButton
                    icon="trash"
                    onPress={() => onDelete(cat)}
                    accessibilityLabel="Delete category"
                    size={36}
                    color="#DC2626"
                  />
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
  const { preference: themePreference } = useAppSelector((state) => state.theme);
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

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

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

  const handleThemeChange = async (preference) => {
    dispatch(setThemePreference(preference));
    applyThemePreference(preference);
    await persistThemePreference(preference);
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
        <ScreenHeader title="Settings" subtitle="Manage your preferences" />

        <Card className="mt-6">
          <View className="flex-row items-center gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-600/20">
              <Text className="text-xl font-bold text-primary dark:text-primary-50">
                {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-content dark:text-white">
                {user?.name || 'User'}
              </Text>
              <Text className="text-sm text-content-secondary dark:text-gray-400">
                {user?.email}
              </Text>
              <Text className="mt-1 text-xs text-content-secondary dark:text-gray-500">
                Version {appVersion}
              </Text>
            </View>
          </View>
        </Card>

        <Card className="mt-4">
          <SectionHeader title="Appearance" />
          <View className="flex-row flex-wrap gap-2">
            {THEME_OPTIONS.map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                selected={themePreference === option.id}
                onPress={() => handleThemeChange(option.id)}
              />
            ))}
          </View>
        </Card>

        {error ? (
          <Text className="mt-4 text-sm text-expense-500">
            {error?.data || error?.error || 'Failed to load categories'}
          </Text>
        ) : null}

        {isLoading ? (
          <View className="mt-6 gap-3">
            <ListItemSkeleton />
            <ListItemSkeleton />
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

        <SecondaryButton
          label="Log out"
          onPress={handleLogout}
          disabled={authLoading}
          variant="danger"
          className="mt-6"
        />

        <View className="h-8" />
      </ScrollView>

      <ModalSheet
        visible={modalVisible}
        onClose={closeModal}
        title={editingCategory ? 'Edit category' : 'New category'}>
        <Text className="mb-4 text-sm capitalize text-content-secondary">{categoryType}</Text>
        <View className="gap-4">
          <FormField
            label="Name"
            placeholder="Category name"
            value={name}
            onChangeText={setName}
            editable={!mutationLoading}
          />

          {mutationError ? (
            <Text className="text-sm text-expense-500">
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
      </ModalSheet>
    </ScreenContainer>
  );
}
