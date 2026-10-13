import '@testing-library/jest-dom';

if (typeof window !== 'undefined' && !window.PointerEvent) {
  // @ts-expect-error jsdom polyfill for PointerEvent
  window.PointerEvent = class PointerEvent extends MouseEvent {
    public pointerId: number;
    public pointerType: string;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 1;
      this.pointerType = params.pointerType ?? 'mouse';
    }
  };
}

// JSDOM does not implement Pointer Capture APIs
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}

if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
