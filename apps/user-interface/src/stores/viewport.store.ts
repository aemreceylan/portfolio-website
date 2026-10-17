import { create } from 'zustand';

/**
 * Responsive viewport breakpoints in pixels
 */
export const VIEWPORT_BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
} as const;

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Viewport state contract for responsive UI adaptation
 */
export interface ViewportState {
  /** Current viewport width in pixels */
  width: number;
  /** Current viewport height in pixels */
  height: number;
  /** True when viewport width is strictly less than 768px */
  isMobile: boolean;
  /** True when viewport width is between 768px (inclusive) and 1024px (exclusive) */
  isTablet: boolean;
  /** True when viewport width is 1024px or greater */
  isDesktop: boolean;
  /** Categorized device classification */
  deviceType: DeviceType;
  /** True if the device supports primary touch input */
  isTouchDevice: boolean;

  /** Manually updates viewport dimensions (used by window resize events or tests) */
  setDimensions: (width: number, height: number) => void;
  /** Initializes window resize listeners and returns a cleanup disposer */
  initialize: () => () => void;
  /** Resets state to default desktop configuration (useful for unit tests) */
  reset: () => void;
}

/**
 * Resolves current window dimensions safely for browser and SSR/test environments
 */
export function getInitialViewport(): { width: number; height: number; isTouchDevice: boolean } {
  if (typeof window !== 'undefined') {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    return {
      width: window.innerWidth || 1200,
      height: window.innerHeight || 800,
      isTouchDevice: isTouch,
    };
  }
  return {
    width: 1200,
    height: 800,
    isTouchDevice: false,
  };
}

/**
 * Calculates responsive flags based on viewport width
 */
export function calculateDeviceType(width: number): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
} {
  const isMobile = width < VIEWPORT_BREAKPOINTS.MOBILE;
  const isTablet = !isMobile && width < VIEWPORT_BREAKPOINTS.TABLET;
  const isDesktop = !isMobile && !isTablet;
  let deviceType: DeviceType = 'desktop';
  if (isMobile) {
    deviceType = 'mobile';
  } else if (isTablet) {
    deviceType = 'tablet';
  }

  return { isMobile, isTablet, isDesktop, deviceType };
}

const initial = getInitialViewport();
const initialDevice = calculateDeviceType(initial.width);

/**
 * Viewport and Responsive Breakpoint Zustand Store
 */
export const useViewportStore = create<ViewportState>((set) => ({
  width: initial.width,
  height: initial.height,
  isTouchDevice: initial.isTouchDevice,
  ...initialDevice,

  setDimensions: (width, height) => {
    const deviceFlags = calculateDeviceType(width);
    set({
      width,
      height,
      ...deviceFlags,
    });
  },

  initialize: () => {
    if (typeof window === 'undefined') {
      return () => {
        // noop for SSR
      };
    }

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const deviceFlags = calculateDeviceType(w);

      set({
        width: w,
        height: h,
        isTouchDevice: isTouch,
        ...deviceFlags,
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  },

  reset: () => {
    const fallback = getInitialViewport();
    const flags = calculateDeviceType(fallback.width);
    set({
      width: fallback.width,
      height: fallback.height,
      isTouchDevice: fallback.isTouchDevice,
      ...flags,
    });
  },
}));

/**
 * Convenience hook to access responsive viewport properties
 */
export function useViewport(): ViewportState {
  return useViewportStore();
}
