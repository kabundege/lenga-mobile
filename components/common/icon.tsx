import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

/**
 * Icon registry: add new Expo vector icon sets here.
 * 1. Import the set: import Ionicons from '@expo/vector-icons/Ionicons';
 * 2. Add an entry: ionicons: { Component: Ionicons, glyphMap: Ionicons.glyphMap },
 * 3. IconType and IconName will automatically include the new set.
 */
const ICON_REGISTRY = {
  material: {
    Component: MaterialCommunityIcons,
    glyphMap: MaterialCommunityIcons.glyphMap,
  },
  antd: {
    Component: AntDesign,
    glyphMap: AntDesign.glyphMap,
  },
  feather: {
    Component: Feather,
    glyphMap: Feather.glyphMap,
  },
  // Example: add more sets:
  // ionicons: { Component: Ionicons, glyphMap: Ionicons.glyphMap },
  // materialIcons: { Component: MaterialIcons, glyphMap: MaterialIcons.glyphMap },
  ionicons: { Component: Ionicons, glyphMap: Ionicons.glyphMap },
  fontAwesome: { Component: FontAwesome, glyphMap: FontAwesome.glyphMap },
  fontAwesome6: { Component: FontAwesome6, glyphMap: FontAwesome6.glyphMap },
} as const;

export type IconType = keyof typeof ICON_REGISTRY;

type GlyphMapFor<K extends IconType> = (typeof ICON_REGISTRY)[K]['glyphMap'];
export type IconName = {
  [K in IconType]: keyof GlyphMapFor<K>;
}[IconType];

export type IconProps = {
  name: IconName;
  type?: IconType;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

const DEFAULT_ICON_TYPE: IconType = 'material';

export function Icon({
  name,
  type = DEFAULT_ICON_TYPE,
  size = 20,
  color = '#000',
  style,
}: IconProps) {
  const entry = ICON_REGISTRY[type];
  if (!entry) return null;
  const { Component } = entry;
  const glyphMap = entry.glyphMap as Record<string, number>;
  if (!glyphMap[name as string]) return null;
  return (
    <Component
      name={name as never}
      size={size}
      color={color}
      style={style}
    />
  );
}

export default Icon;
