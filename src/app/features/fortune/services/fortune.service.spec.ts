import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RANDOM_FORTUNE_URL, FortuneService, MAX_COOKIE_ESTIMATE, MIN_COOKIE_ESTIMATE } from './fortune.service';

describe('FortuneService', () => {
  let service: FortuneService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FortuneService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.restoreAllMocks();
  });

  it('creates a random three-digit inventory for a page visit', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const inventory = service.createRandomInventory();

    expect(inventory).toBeGreaterThanOrEqual(MIN_COOKIE_ESTIMATE);
    expect(inventory).toBeLessThanOrEqual(MAX_COOKIE_ESTIMATE);
    httpTesting.expectNone(RANDOM_FORTUNE_URL);
  });

  it('fetches and validates a random fortune response', () => {
    let response: unknown;
    service.fetchFortune().subscribe((fortune) => response = fortune);
    const request = httpTesting.expectOne(RANDOM_FORTUNE_URL);
    expect(request.request.method).toBe('GET');
    request.flush({ fortune: 'A practical question will open an interesting conversation.' });

    expect(response).toEqual({ fortune: 'A practical question will open an interesting conversation.' });
  });

  it('rejects invalid API responses', () => {
    let requestFailed = false;
    service.fetchFortune().subscribe({ error: () => requestFailed = true });
    httpTesting.expectOne(RANDOM_FORTUNE_URL).flush({ fortune: '' });

    expect(requestFailed).toBe(true);
  });

  it('decrements once for each successful opening', () => {
    expect(service.decrementInventory(76)).toBe(75);
    expect(service.decrementInventory(75)).toBe(74);
  });

  it('never decrements the inventory below zero', () => {
    expect(service.decrementInventory(0)).toBe(0);
  });
});