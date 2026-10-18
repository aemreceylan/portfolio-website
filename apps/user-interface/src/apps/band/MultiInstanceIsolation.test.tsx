import { describe, it, expect, beforeEach } from 'vitest';
import {
  getInstanceId,
  getSessionKey,
  getActiveSession,
  setActiveSession,
  clearActiveSession,
} from '../../../../band/frontend/band/src/services/simulatedBackend';

describe('BAND Multi-Instance Environment & Session Isolation', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset window.location.search
    window.history.replaceState({}, '', '/');
  });

  it('correctly resolves default instanceId and session key when query param is absent', () => {
    expect(getInstanceId()).toBe('default');
    expect(getSessionKey()).toBe('band_db_session');
  });

  it('correctly parses instanceId from URL search params', () => {
    window.history.replaceState({}, '', '/?instanceId=band-2');
    expect(getInstanceId()).toBe('band-2');
    expect(getSessionKey()).toBe('band_db_session_band-2');
  });

  it('completely isolates session state between two separate window instances (Alice vs Bob)', () => {
    // 1. Window 1: Alice logs in under instance 'band'
    window.history.replaceState({}, '', '/?instanceId=band');
    const aliceSession = {
      isAuth: true,
      authToken: 'token_alice_123',
      userId: 'usr_alice',
      nick: 'Alice',
      profilePhotoURL: 'img/alice.png',
      roles: ['0'],
    };
    setActiveSession(aliceSession);

    expect(getActiveSession()).toEqual(aliceSession);
    expect(localStorage.getItem('band_db_session_band')).toBeDefined();

    // 2. Window 2: Bob opens and logs in under instance 'band-2'
    window.history.replaceState({}, '', '/?instanceId=band-2');
    // Initially Bob has NO active session in his window!
    expect(getActiveSession()).toBeNull();

    const bobSession = {
      isAuth: true,
      authToken: 'token_bob_456',
      userId: 'usr_bob',
      nick: 'Bob',
      profilePhotoURL: 'img/bob.png',
      roles: ['0'],
    };
    setActiveSession(bobSession);

    expect(getActiveSession()).toEqual(bobSession);
    expect(localStorage.getItem('band_db_session_band-2')).toBeDefined();

    // 3. Switch back to Window 1: Alice's session is STILL intact and unaffected by Bob!
    window.history.replaceState({}, '', '/?instanceId=band');
    expect(getActiveSession()?.nick).toBe('Alice');
    expect(getActiveSession()?.userId).toBe('usr_alice');

    // 4. Bob logs out in Window 2: Alice is STILL logged in!
    window.history.replaceState({}, '', '/?instanceId=band-2');
    clearActiveSession();
    expect(getActiveSession()).toBeNull();

    window.history.replaceState({}, '', '/?instanceId=band');
    expect(getActiveSession()?.nick).toBe('Alice');
  });
});
