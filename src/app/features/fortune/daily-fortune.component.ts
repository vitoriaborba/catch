import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ArcadeButtonComponent } from '../../shared/components/arcade-button/arcade-button.component';
import { DailyFortuneState } from './models/fortune.model';
import { FortuneService } from './services/fortune.service';

@Component({
  selector: 'app-daily-fortune',
  standalone: true,
  imports: [ArcadeButtonComponent],
  templateUrl: './daily-fortune.component.html',
  styleUrl: './daily-fortune.component.scss',
})
export class DailyFortuneComponent implements OnInit, OnDestroy {
  protected readonly state = signal<DailyFortuneState>('closed');
  protected readonly remainingCookies = signal(0);
  protected readonly fortune = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly revealStarted = signal(false);
  protected readonly showFortunePopup = signal(false);

  private animationTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly fortuneService: FortuneService) {}

  ngOnInit(): void {
    this.remainingCookies.set(this.fortuneService.createRandomInventory());
  }

  ngOnDestroy(): void {
    if (this.animationTimeout !== null) {
      clearTimeout(this.animationTimeout);
    }
  }

  protected async openCookie(): Promise<void> {
    if (this.state() === 'opening' || this.remainingCookies() <= 0) {
      return;
    }

    const previousState = this.state();
    const previousFortune = this.fortune();
    const previousRevealStarted = this.revealStarted();
    this.state.set('opening');
    this.errorMessage.set(null);
    this.revealStarted.set(false);
    this.showFortunePopup.set(false);

    try {
      const randomFortune = await firstValueFrom(this.fortuneService.fetchFortune());
      this.remainingCookies.set(this.fortuneService.decrementInventory(this.remainingCookies()));
      this.fortune.set(randomFortune.fortune);
      this.revealStarted.set(true);
      await this.waitForReveal();
      this.state.set('revealed');
      this.showFortunePopup.set(true);
    } catch {
      this.revealStarted.set(previousState === 'revealed' && previousRevealStarted && previousFortune !== null);
      this.state.set(this.revealStarted() ? 'revealed' : 'closed');
      this.errorMessage.set('Oh no. The fortune cookies are temporarily unavailable. Philipp may have hidden them too well.');
    }
  }

  protected closeFortunePopup(): void {
    this.showFortunePopup.set(false);
    this.revealStarted.set(false);
  }

  @HostListener('document:keydown.escape')
  protected closeFortunePopupOnEscape(): void {
    this.closeFortunePopup();
  }

  private waitForReveal(): Promise<void> {
    const reducedMotion = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.animationTimeout = setTimeout(() => {
        this.animationTimeout = null;
        resolve();
      }, 1350);
    });
  }
}