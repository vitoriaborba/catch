import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FortuneResponse } from '../models/fortune.model';

export const RANDOM_FORTUNE_URL = 'https://dumbapis.com/fortune';
export const MIN_COOKIE_ESTIMATE = 100;
export const MAX_COOKIE_ESTIMATE = 999;

@Injectable({ providedIn: 'root' })
export class FortuneService {
  constructor(private readonly http: HttpClient) {}

  fetchFortune(): Observable<FortuneResponse> {
    return this.http.get<unknown>(RANDOM_FORTUNE_URL).pipe(map((response) => this.parseResponse(response)));
  }

  createRandomInventory(): number {
    return MIN_COOKIE_ESTIMATE + Math.floor(Math.random() * (MAX_COOKIE_ESTIMATE - MIN_COOKIE_ESTIMATE + 1));
  }

  decrementInventory(remainingCookies: number): number {
    return Math.max(0, Math.min(MAX_COOKIE_ESTIMATE, Math.floor(remainingCookies)) - 1);
  }

  private parseResponse(value: unknown): FortuneResponse {
    if (!this.isRecord(value) || typeof value['fortune'] !== 'string' || value['fortune'].trim().length === 0
    ) {
      throw new Error('Invalid daily fortune response');
    }

    return { fortune: value['fortune'].trim() };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}