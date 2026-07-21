import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface AvatarRendererProps {
  avatarUrl?: string | null;
  size?: number;
  style?: any;
}

export default function AvatarRenderer({ avatarUrl, size = 50, style }: AvatarRendererProps) {
  // 1. Fallback / Default
  if (!avatarUrl) {
    return <FontAwesome5 name="user-ninja" size={size * 0.5} color={Colors.dark.primary} style={style} />;
  }

  // 2. Hacker Icon
  if (avatarUrl.startsWith('icon:')) {
    const iconName = avatarUrl.replace('icon:', '');
    return <FontAwesome5 name={iconName as any} size={size * 0.5} color={Colors.dark.primary} style={style} />;
  }

  // 3. Real Uploaded Photo
  return (
    <Image 
      source={{ uri: avatarUrl }} 
      style={[
        { width: size, height: size, borderRadius: size / 2, resizeMode: 'cover' }, 
        style
      ]} 
    />
  );
}
