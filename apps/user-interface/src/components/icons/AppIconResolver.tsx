import React from 'react';
import { useThemeStore } from '#stores/theme.store';
import { getTheme } from '#themes/index';

export interface AppIconResolverProps {
  appId?: string;
  fileExtension?: 'txt' | 'md' | 'js' | string;
  size?: number;
  className?: string;
  variant?: 'app' | 'file' | 'brand';
}

/**
 * AppIconResolver:
 * Dynamically resolves icons according to the active theme via the pluggable ThemeRegistry.
 * Decouples icon presentation from specific theme IDs, allowing any newly registered theme
 * to provide its own icon implementations for applications, files, and branding with 100% type-safety.
 */
export const AppIconResolver: React.FC<AppIconResolverProps> = ({
  appId,
  fileExtension,
  size = 32,
  className = '',
  variant = 'app',
}) => {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const theme = getTheme(currentTheme);

  if (variant === 'brand' || appId === 'brand') {
    const BrandIcon = theme.icons.brandIcon;
    return <BrandIcon size={size} className={className} />;
  }

  if (variant === 'file' || fileExtension) {
    const ext = fileExtension?.toLowerCase().replace(/^\./, '') ?? '';
    const FileIcon = theme.icons.fileIcons[ext] || theme.icons.fallbackFileIcon;
    return <FileIcon size={size} className={className} />;
  }

  const resolvedAppId = appId || 'terminal';
  const AppIcon = theme.icons.appIcons[resolvedAppId] || theme.icons.fallbackAppIcon;
  return <AppIcon size={size} className={className} />;
};

export default AppIconResolver;
