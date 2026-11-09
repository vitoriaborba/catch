import {
  DEFAULT_SOCK_SPAWN_PROBABILITIES,
  evaluateSockOutcome,
  BasketHitbox,
  GameEngineService,
  isWithinBasketCatchZone,
  SockSpawnProbabilities,
} from './game-engine.service';
import { ColourfulSockVariant, SockKind } from '../models/sock.model';

const defaultProbabilities: SockSpawnProbabilities = { colourful: 0.6, black: 0.25, white: 0.15 };
const blackOnlyProbabilities: SockSpawnProbabilities = { colourful: 0, black: 1, white: 0 };
const whiteOnlyProbabilities: SockSpawnProbabilities = { colourful: 0, black: 0, white: 1 };

describe('GameEngineService', () => {
  it('uses the requested initial sock spawn probabilities', () => {
    expect(DEFAULT_SOCK_SPAWN_PROBABILITIES).toEqual({ colourful: 0.6, black: 0.25, white: 0.15 });
  });

  it('validates each sock colour as an independent pair', () => {
    expect(evaluateSockOutcome(0, 0)).toBe('success');
    expect(evaluateSockOutcome(2, 0)).toBe('success');
    expect(evaluateSockOutcome(0, 4)).toBe('success');
    expect(evaluateSockOutcome(1, 0)).toBe('failure');
    expect(evaluateSockOutcome(0, 1)).toBe('failure');
    expect(evaluateSockOutcome(1, 1)).toBe('failure');
  });

  it('only catches socks inside the basket hit zone', () => {
    const hitbox: BasketHitbox = { centerX: 50, centerY: 80, halfWidth: 2.3, halfHeight: 2.5 };
    expect(isWithinBasketCatchZone(52.3, 80, hitbox)).toBe(true);
    expect(isWithinBasketCatchZone(52.4, 80, hitbox)).toBe(false);
    expect(isWithinBasketCatchZone(54, 80, hitbox)).toBe(false);
    expect(isWithinBasketCatchZone(50, 82.6, hitbox)).toBe(false);
    expect(isWithinBasketCatchZone(50, 80, { ...hitbox, centerY: 70, halfHeight: 5 })).toBe(false);
  });

  it('ends with the colourful-sock outcome as soon as one is caught', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const engine = new GameEngineService(defaultProbabilities);
    engine.start(0);

    let result = engine.tick(0, 8);
    for (let now = 100; now <= 6000 && result.outcome === null; now += 100) {
      result = engine.tick(now, 8);
    }

    expect(result.caughtColourful).toBe(true);
    expect(result.outcome).toBe('protocol');
    vi.restoreAllMocks();
  });

  it('keeps the colourful-sock outcome priority on the exact time boundary', () => {
    let randomIndex = 0;
    const randomValues = [0, 0, 0, 1];
    vi.spyOn(Math, 'random').mockImplementation(() => randomValues[randomIndex++ % randomValues.length]);
    const engine = new GameEngineService(defaultProbabilities);
    engine.start(0);

    for (let now = 100; now < 30_000; now += 100) {
      engine.tick(now, 50);
    }
    const result = engine.tick(30_000, 8);

    expect(result.remainingSeconds).toBe(0);
    expect(result.caughtColourful).toBe(true);
    expect(result.outcome).toBe('protocol');
    vi.restoreAllMocks();
  });

  it('counts caught black socks and gives missed black socks no penalty', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const catchEngine = new GameEngineService(blackOnlyProbabilities);
    catchEngine.start(0);

    let caughtResult = catchEngine.tick(0, 50);
    for (let now = 100; now <= 5000 && !caughtResult.caughtBlack; now += 100) {
      caughtResult = catchEngine.tick(now, 50);
    }

    expect(caughtResult.caughtBlack).toBe(true);
    expect(caughtResult.blackSockCount).toBe(1);

    random.mockReturnValue(0.99);
    const missEngine = new GameEngineService(blackOnlyProbabilities);
    missEngine.start(0);

    let missedResult = missEngine.tick(0, 50);
    for (let now = 100; now <= 5000 && !missedResult.missedAcceptableSock; now += 100) {
      missedResult = missEngine.tick(now, 50);
    }

    expect(missedResult.missedAcceptableSock).toBe(true);
    expect(missedResult.blackSockCount).toBe(0);
    vi.restoreAllMocks();
  });

  it('counts white socks independently and allows zero pairs', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const engine = new GameEngineService(whiteOnlyProbabilities);
    engine.start(0);

    let result = engine.tick(0, 50);
    for (let now = 100; now <= 5000 && !result.caughtWhite; now += 100) {
      result = engine.tick(now, 50);
    }

    expect(result.caughtWhite).toBe(true);
    expect(result.blackSockCount).toBe(0);
    expect(result.whiteSockCount).toBe(1);
    expect(evaluateSockOutcome(result.blackSockCount, result.whiteSockCount)).toBe('failure');
    expect(evaluateSockOutcome(0, 0)).toBe('success');
    vi.restoreAllMocks();
  });

  it('supports configurable spawn probabilities', () => {
    const randomValues = [0.025, 0.5, 0.5, 0.5, 0.2, 0.5, 0.5, 0.75, 0.5, 0.5];
    vi.spyOn(Math, 'random').mockImplementation(() => randomValues.shift() ?? 0.5);
    const probabilities = { colourful: 0.05, black: 0.25, white: 0.7 };
    const kinds: SockKind[] = [];
    const variants: Array<ColourfulSockVariant | null> = [];

    for (let index = 0; index < 3; index += 1) {
      const engine = new GameEngineService(probabilities);
      engine.start(0);
      const sock = engine.tick(820, 50).socks[0];
      kinds.push(sock.kind);
      variants.push(sock.variant);
    }

    expect(kinds).toEqual(['colourful', 'black', 'white']);
    expect(variants).toEqual(['blue', null, null]);
    vi.restoreAllMocks();
  });

  it('ends at thirty seconds and evaluates both collected counts', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const engine = new GameEngineService(defaultProbabilities);
    engine.start(1000);

    expect(engine.tick(30_999, 0).outcome).toBeNull();
    const result = engine.tick(31_000, 0);

    expect(result.remainingSeconds).toBe(0);
    expect(result.outcome).toBe('success');
    expect(result.blackSockCount).toBe(0);
    expect(result.whiteSockCount).toBe(0);
    vi.restoreAllMocks();
  });
});