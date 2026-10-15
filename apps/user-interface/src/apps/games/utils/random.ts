/**
 * Cryptographically secure randomness helpers for arcade simulations.
 * Uses window.crypto / crypto.getRandomValues to satisfy strict DevSecOps
 * and SonarQube pseudo-random security guidelines (S2245 / sonarjs/pseudo-random).
 */

/**
 * Returns a cryptographically secure random float in the range [0, 1).
 */
export const getRandomFloat = (): number => {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] / (0xffffffff + 1);
};

/**
 * Returns a cryptographically secure random integer in the range [min, max).
 */
export const getRandomInt = (min: number, max: number): number => {
  const float = getRandomFloat();
  return Math.floor(float * (max - min)) + min;
};

/**
 * Returns a cryptographically secure random spread value centered at 0 in the range [-spread/2, spread/2].
 */
export const getRandomSpread = (spread: number): number => {
  return (getRandomFloat() - 0.5) * spread;
};

/**
 * Returns either 1 or -1 with equal probability.
 */
export const getRandomSign = (): number => {
  return getRandomFloat() > 0.5 ? 1 : -1;
};
