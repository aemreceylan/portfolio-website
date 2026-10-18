/**
 * Window positioning and geometry coordinates
 */
export interface WindowPosition {
  x: number;
  y: number;
}

/**
 * Window dimensions
 */
export interface WindowSize {
  width: number;
  height: number;
}

/**
 * Complete window boundaries
 */
export interface WindowBounds extends WindowPosition, WindowSize {}

/**
 * Runtime state representation of an active window
 */
export interface WindowState {
  id: string;
  appId?: string;
  title: string;
  iconName: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  bounds: WindowBounds;
  previousBounds?: WindowBounds;
  minSize: WindowSize;
  resizable: boolean;
}
