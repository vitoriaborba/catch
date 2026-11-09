import { SpeechMessageService, SPEECH_MESSAGES } from './speech-message.service';

describe('SpeechMessageService', () => {
  afterEach(() => vi.restoreAllMocks());

  it('selects from the requested category without repeating the previous message', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const service = new SpeechMessageService();

    const firstMessage = service.getMessage('acceptableCatch');
    const secondMessage = service.getMessage('acceptableCatch');

    expect(SPEECH_MESSAGES.acceptableCatch).toContain(firstMessage);
    expect(SPEECH_MESSAGES.acceptableCatch).toContain(secondMessage);
    expect(secondMessage).not.toBe(firstMessage);
  });

  it('shuffles each category so every phrase is used before the list repeats', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.42);
    const service = new SpeechMessageService();
    const selectedMessages = Array.from(
      { length: SPEECH_MESSAGES.miss.length },
      () => service.getMessage('miss'),
    );

    expect(new Set(selectedMessages).size).toBe(SPEECH_MESSAGES.miss.length);
    expect(selectedMessages).not.toEqual(SPEECH_MESSAGES.miss);
  });

  it('can keep some ordinary catches silent', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const service = new SpeechMessageService();

    expect(service.getMessage('acceptableCatch')).toBeNull();
  });

  it('always returns a reaction when an acceptable sock is missed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const service = new SpeechMessageService();

    expect(SPEECH_MESSAGES.miss).toContain(service.getMessage('miss'));
  });

  it('always provides a colourful-sock reaction', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const service = new SpeechMessageService();

    expect(SPEECH_MESSAGES.colourfulCatch).toContain(service.getMessage('colourfulCatch'));
  });

  it('keeps bubble duration and idle cadence within their intended ranges', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const service = new SpeechMessageService();
    expect(service.getDisplayDurationMs()).toBe(1500);
    expect(service.getNextIdleDelayMs()).toBe(10_000);

    vi.mocked(Math.random).mockReturnValue(0.999);
    expect(service.getDisplayDurationMs()).toBeLessThanOrEqual(2500);
    expect(service.getNextIdleDelayMs()).toBeLessThanOrEqual(15_000);
  });
});