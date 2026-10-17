import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  useViewportStore,
  calculateDeviceType,
  getInitialViewport,
  VIEWPORT_BREAKPOINTS,
} from './viewport.store';

describe('viewport.store', () => {
  beforeEach(() => {
    useViewportStore.getState().reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('calculateDeviceType', () => {
    it('should expose consistent breakpoint constants', () => {
      expect(VIEWPORT_BREAKPOINTS.MOBILE).toBe(768);
      expect(VIEWPORT_BREAKPOINTS.TABLET).toBe(1024);
    });

    it('should classify screens under 768px as mobile', () => {
      const result375 = calculateDeviceType(375);
      expect(result375.isMobile).toBe(true);
      expect(result375.isTablet).toBe(false);
      expect(result375.isDesktop).toBe(false);
      expect(result375.deviceType).toBe('mobile');

      const result767 = calculateDeviceType(767);
      expect(result767.isMobile).toBe(true);
      expect(result767.deviceType).toBe('mobile');
    });

    it('should classify screens between 768px and 1023px as tablet', () => {
      const result768 = calculateDeviceType(768);
      expect(result768.isMobile).toBe(false);
      expect(result768.isTablet).toBe(true);
      expect(result768.isDesktop).toBe(false);
      expect(result768.deviceType).toBe('tablet');

      const result1023 = calculateDeviceType(1023);
      expect(result1023.isTablet).toBe(true);
      expect(result1023.deviceType).toBe('tablet');
    });

    it('should classify screens 1024px and wider as desktop', () => {
      const result1024 = calculateDeviceType(1024);
      expect(result1024.isMobile).toBe(false);
      expect(result1024.isTablet).toBe(false);
      expect(result1024.isDesktop).toBe(true);
      expect(result1024.deviceType).toBe('desktop');

      const result1920 = calculateDeviceType(1920);
      expect(result1920.isDesktop).toBe(true);
      expect(result1920.deviceType).toBe('desktop');
    });
  });

  describe('setDimensions', () => {
    it('should update dimensions and recalculate device flags', () => {
      const store = useViewportStore.getState();

      store.setDimensions(390, 844);
      const mobileState = useViewportStore.getState();
      expect(mobileState.width).toBe(390);
      expect(mobileState.height).toBe(844);
      expect(mobileState.isMobile).toBe(true);
      expect(mobileState.isDesktop).toBe(false);
      expect(mobileState.deviceType).toBe('mobile');

      store.setDimensions(1440, 900);
      const desktopState = useViewportStore.getState();
      expect(desktopState.width).toBe(1440);
      expect(desktopState.height).toBe(900);
      expect(desktopState.isMobile).toBe(false);
      expect(desktopState.isDesktop).toBe(true);
      expect(desktopState.deviceType).toBe('desktop');
    });
  });

  describe('initialize and resize listener', () => {
    it('should attach resize listener and update on window resize', () => {
      const cleanup = useViewportStore.getState().initialize();

      // Simulate window resize to mobile
      window.innerWidth = 412;
      window.innerHeight = 915;
      window.dispatchEvent(new Event('resize'));

      const state = useViewportStore.getState();
      expect(state.width).toBe(412);
      expect(state.height).toBe(915);
      expect(state.isMobile).toBe(true);

      // Clean up
      cleanup();

      // After cleanup, further resizes should not trigger updates
      window.innerWidth = 1280;
      window.dispatchEvent(new Event('resize'));

      expect(useViewportStore.getState().width).toBe(412);
    });
  });

  describe('getInitialViewport and reset', () => {
    it('should resolve default dimensions and reset correctly', () => {
      const initial = getInitialViewport();
      expect(initial.width).toBeGreaterThan(0);
      expect(initial.height).toBeGreaterThan(0);

      useViewportStore.getState().setDimensions(320, 568);
      expect(useViewportStore.getState().isMobile).toBe(true);

      useViewportStore.getState().reset();
      expect(useViewportStore.getState().width).toBe(window.innerWidth || 1200);
    });
  });
});
