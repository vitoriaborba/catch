export type SockKind = 'black' | 'white' | 'colourful';
export type ColourfulSockVariant = 'red' | 'green' | 'blue' | 'yellow';

export interface FallingSock {
  id: number;
  kind: SockKind;
  variant: ColourfulSockVariant | null;
  x: number;
  y: number;
  speed: number;
}

export type GameOutcome = 'protocol' | 'success' | 'failure';

export interface GameTick {
  socks: FallingSock[];
  remainingSeconds: number;
  blackSockCount: number;
  whiteSockCount: number;
  caughtBlack: boolean;
  caughtWhite: boolean;
  caughtColourful: boolean;
  missedAcceptableSock: boolean;
  outcome: GameOutcome | null;
}