import { Pressable, View } from 'react-native';

export function Card({ children, className = '', onPress }) {
  const content = (
    <View
      className={`rounded-2xl border border-border bg-surface p-4 shadow-card dark:border-border-dark dark:bg-surface-card ${className}`}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-90">
        {content}
      </Pressable>
    );
  }

  return content;
}
