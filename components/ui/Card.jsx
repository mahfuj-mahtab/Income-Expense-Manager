import { Pressable, View } from 'react-native';

export function Card({ children, className = '', onPress, flush = false }) {
  const content = (
    <View
      className={`rounded-card border border-border/80 bg-surface shadow-card dark:border-border-dark dark:bg-surface-card ${
        flush ? '' : 'p-4'
      } ${className}`}>
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
