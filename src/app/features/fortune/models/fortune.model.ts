export interface FortuneResponse {
  fortune: string;
}

export type DailyFortuneState = 'closed' | 'opening' | 'revealed';