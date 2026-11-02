import { Image } from 'expo-image';
import { View } from 'react-native';

export function BrandMark({ size = 120 }) {
  const radius = Math.round(size * 0.28);

  return (
    <View
      style={{
        shadowColor: '#041525',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.32,
        shadowRadius: 20,
        elevation: 12,
      }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
        <Image
          source={require('../../assets/images/money-plan-mark.png')}
          style={{ width: size * 0.74, height: size * 0.74 }}
          contentFit="contain"
          accessibilityLabel="Money Plan"
        />
      </View>
    </View>
  );
}
