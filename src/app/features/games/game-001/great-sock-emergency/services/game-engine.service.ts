import { Inject, Injectable, InjectionToken } from '@angular/core';
import { ColourfulSockVariant, FallingSock, GameOutcome, GameTick, SockKind } from '../models/sock.model';

export interface SockSpawnProbabilities {
  colourful: number;
  black: number;
  white: number;
}

export const DEFAULT_SOCK_SPAWN_PROBABILITIES: SockSpawnProbabilities = {
  colourful: 0.6,
  black: 0.25,
  white: 0.15,
};

export const SOCK_SPAWN_PROBABILITIES = new InjectionToken<SockSpawnProbabilities>(
  'SOCK_SPAWN_PROBABILITIES',
  { providedIn: 'root', factory: () => DEFAULT_SOCK_SPAWN_PROBABILITIES },
);

export interface BasketHitbox {
  centerX: number;
  centerY: number;
  halfWidth: number;
  halfHeight: number;
}

const DEFAULT_BASKET_HITBOX: BasketHitbox = {
  centerX: 50,
  centerY: 80,
  halfWidth: 5.5,
  halfHeight: 4,
};

interface SockTickEvents {
  caughtBlack: boolean;
  caughtWhite: boolean;
  caughtColourful: boolean;
  missedAcceptableSock: boolean;
  outcome: GameOutcome | null;
}

export function evaluateSockOutcome(
  blackSockCount: number,
  whiteSockCount: number,
): Exclude<GameOutcome, 'protocol'> {
  return blackSockCount + whiteSockCount > 0 && blackSockCount % 2 === 0 && whiteSockCount % 2 === 0
    ? 'success'
    : 'failure';
}

export function isWithinBasketCatchZone(sockX: number, sockY: number, hitbox: BasketHitbox): boolean {
  return Math.abs(sockX - hitbox.centerX) <= hitbox.halfWidth
    && Math.abs(sockY - hitbox.centerY) <= hitbox.halfHeight;
}

@Injectable()
export class GameEngineService {
  private readonly colourfulSockVariants: ColourfulSockVariant[] = ['red', 'green', 'blue', 'yellow'];
  private readonly durationMs = 30_000;
  private readonly spawnIntervalMs = 820;
  private startedAt: number | null = null;
  private previousFrameAt = 0;
  private lastSpawnAt = 0;
  private nextSockId = 0;
  private blackSockCount = 0;
  private whiteSockCount = 0;
  private socks: FallingSock[] = [];
  private active = false;

  constructor(
    @Inject(SOCK_SPAWN_PROBABILITIES)
    private readonly spawnProbabilities: SockSpawnProbabilities,
  ) {}

  start(now: number): void {
    this.startedAt = null;
    this.previousFrameAt = now;
    this.lastSpawnAt = now;
    this.nextSockId = 0;
    this.blackSockCount = 0;
    this.whiteSockCount = 0;
    this.socks = [];
    this.active = true;
  }

  tick(now: number, playerX: number, basketHitbox?: BasketHitbox): GameTick {
    const activeBasketHitbox = basketHitbox ?? { ...DEFAULT_BASKET_HITBOX, centerX: playerX };
    const remainingMs = this.startedAt === null
      ? this.durationMs
      : Math.max(0, this.durationMs - (now - this.startedAt));
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    if (!this.active) {
      return this.snapshot(remainingSeconds);
    }

    const deltaSeconds = Math.min(Math.max(now - this.previousFrameAt, 0), 100) / 1000;
    this.previousFrameAt = now;

    if (remainingMs > 0 && now - this.lastSpawnAt >= this.spawnIntervalMs) {
      this.lastSpawnAt = now;
      this.socks.push(this.createSock());
    }

    const events = this.advanceSocks(deltaSeconds, activeBasketHitbox);
    if (this.startedAt === null && (events.caughtBlack || events.caughtWhite)) {
      this.startedAt = now;
    }
    let outcome = events.outcome;
    if (outcome === null && remainingMs === 0) {
      this.active = false;
      outcome = evaluateSockOutcome(this.blackSockCount, this.whiteSockCount);
    }

    return this.snapshot(
      remainingSeconds,
      outcome,
      events.caughtBlack,
      events.caughtWhite,
      events.caughtColourful,
      events.missedAcceptableSock,
    );
  }

  private advanceSocks(deltaSeconds: number, basketHitbox: BasketHitbox): SockTickEvents {
    let caughtBlack = false;
    let caughtWhite = false;
    let caughtColourful = false;
    let missedAcceptableSock = false;
    let outcome: GameOutcome | null = null;
    const remainingSocks: FallingSock[] = [];

    for (const sock of this.socks) {
      const nextY = sock.y + sock.speed * deltaSeconds;
      const caught = isWithinBasketCatchZone(sock.x, nextY, basketHitbox);

      if (caught && sock.kind === 'colourful') {
        caughtColourful = true;
        outcome = 'protocol';
        this.active = false;
        break;
      }

      if (caught) {
        if (sock.kind === 'black') {
          caughtBlack = true;
          this.blackSockCount += 1;
        } else {
          caughtWhite = true;
          this.whiteSockCount += 1;
        }
      } else if (nextY > 100) {
        missedAcceptableSock ||= sock.kind !== 'colourful';
      } else {
        remainingSocks.push({ ...sock, y: nextY });
      }
    }

    this.socks = remainingSocks;
    return { caughtBlack, caughtWhite, caughtColourful, missedAcceptableSock, outcome };
  }

  private createSock(): FallingSock {
    const totalWeight = this.spawnProbabilities.colourful
      + this.spawnProbabilities.black
      + this.spawnProbabilities.white;
    const roll = Math.random() * totalWeight;
    const colourfulThreshold = this.spawnProbabilities.colourful;
    const blackThreshold = colourfulThreshold + this.spawnProbabilities.black;
    let kind: SockKind;
    if (roll < colourfulThreshold) {
      kind = 'colourful';
    } else if (roll < blackThreshold) {
      kind = 'black';
    } else {
      kind = 'white';
    }
    const variant = kind === 'colourful'
      ? this.colourfulSockVariants[Math.floor(Math.random() * this.colourfulSockVariants.length)]
      : null;

    return {
      id: this.nextSockId++,
      kind,
      variant,
      x: 8 + Math.random() * 84,
      y: -8,
      speed: 20 + Math.random() * 12,
    };
  }

  private snapshot(
    remainingSeconds: number,
    outcome: GameOutcome | null = null,
    caughtBlack = false,
    caughtWhite = false,
    caughtColourful = false,
    missedAcceptableSock = false,
  ): GameTick {
    return {
      socks: this.socks,
      remainingSeconds,
      blackSockCount: this.blackSockCount,
      whiteSockCount: this.whiteSockCount,
      caughtBlack,
      caughtWhite,
      caughtColourful,
      missedAcceptableSock,
      outcome,
    };
  }
}