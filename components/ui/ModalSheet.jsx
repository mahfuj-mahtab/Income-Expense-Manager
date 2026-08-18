import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

export function ModalSheet({
  visible,
  onClose,
  title,
  children,
  scrollable = true,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Close modal" />
        <View className="max-h-[90%] rounded-t-3xl bg-surface px-6 pb-8 pt-5 shadow-elevated dark:bg-surface-card">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-content dark:text-white">{title}</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-bg dark:bg-surface-dark">
              <Text className="text-lg text-content-secondary">×</Text>
            </Pressable>
          </View>
          {scrollable ? (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {children}
              <View className="h-4" />
            </ScrollView>
          ) : (
            children
          )}
        </View>
      </View>
    </Modal>
  );
}
