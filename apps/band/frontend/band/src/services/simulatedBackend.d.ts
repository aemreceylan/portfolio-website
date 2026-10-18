export interface SimulatedSession {
  isAuth: boolean;
  authToken: string;
  profileId?: string;
  userId: string;
  profilePhotoURL?: string;
  nick: string;
  roles?: string[];
}

export function getInstanceId(): string;
export function getSessionKey(): string;
export function getActiveSession(): SimulatedSession | null;
export function setActiveSession(session: SimulatedSession): void;
export function clearActiveSession(): void;
export function emitSimulatedSectionList(): void;
export function emitSimulatedUserList(): void;
export function handleSimulatedRequest(options: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<any>;
export function createBandSocket(ioClient: any, authToken?: string): any;
