import React from 'react';

export type ThemeId = 'spatial-glass' | 'swiss-industrial' | string;

export interface ThemeIconProps {
  size?: number;
  className?: string;
}

export type ThemeIconComponent = React.ComponentType<ThemeIconProps>;

export interface ThemeIcons {
  appIcons: Record<string, ThemeIconComponent>;
  fileIcons: Record<string, ThemeIconComponent>;
  brandIcon: ThemeIconComponent;
  fallbackAppIcon: ThemeIconComponent;
  fallbackFileIcon: ThemeIconComponent;
}

export interface ThemeColors {
  accentColor: string;
  accentRgb: string;
  wallpaperBackground: string;
  extraCssVariables?: Record<string, string>;
}

export interface ThemeTypography {
  fontSans?: string;
  fontMono?: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  subtitle: string;
  description: string;
  colors: ThemeColors;
  typography?: ThemeTypography;
  icons: ThemeIcons;
}

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  subtitle: string;
  description: string;
  accentColor: string;
  accentRgb: string;
  wallpaperBackground: string;
}
