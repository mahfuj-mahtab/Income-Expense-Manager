import { useEffect, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ModalSheet({
  visible,
  onClose,
  title,
  children,
  scrollable = true,
}) {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
    }
  }, [visible]);

  const windowHeight = Dimensions.get('window').height;
  const sheetMaxHeight = windowHeight - keyboardHeight - insets.top - 12;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Close modal" />
        <View
          className="rounded-t-sheet bg-surface px-6 pb-8 pt-3 shadow-elevated dark:bg-surface-card"
          style={{ maxHeight: sheetMaxHeight, marginBottom: keyboardHeight }}>
          <View className="mb-4 items-center">
            <View className="h-1.5 w-10 rounded-full bg-border dark:bg-border-dark" />
          </View>
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-xl font-bold tracking-tight text-content dark:text-white">
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-bg dark:bg-surface-dark">
              <Text className="text-lg text-content-secondary">×</Text>
            </Pressable>
          </View>
          {scrollable ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive">
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
