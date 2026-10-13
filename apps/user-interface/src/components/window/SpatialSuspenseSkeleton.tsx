import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpatialSuspenseSkeletonProps {
  /** Optional title of the lazy-loading application displayed during module boot */
  appTitle?: string;
}

/**
 * Aesthetic loading placeholder rendered inside a window while dynamic React.lazy()
 * chunks are asynchronously fetched across the network.
 */
export const SpatialSuspenseSkeleton: React.FC<SpatialSuspenseSkeletonProps> = ({ appTitle }) => {
  return (
    <div className="spatial-skeleton-container" data-testid="suspense-skeleton">
      <div className="skeleton-orb">
        <Loader2 className="animate-spin" size={24} />
      </div>
      <div className="skeleton-text">
        BOOTING MODULE... {appTitle ? `(${appTitle})` : ''}
      </div>
    </div>
  );
};
