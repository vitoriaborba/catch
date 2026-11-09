import { Component, ElementRef, HostListener, OnDestroy, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArcadeAssetKey } from '../../../../shared/assets/arcade-assets';
import { AssetPlaceholderComponent } from '../../../../shared/components/asset-placeholder/asset-placeholder.component';
import { ArcadeButtonComponent } from '../../../../shared/components/arcade-button/arcade-button.component';
import { FallingSock, GameOutcome } from './models/sock.model';
import { BasketHitbox, GameEngineService } from './services/game-engine.service';

@Component({
  selector: 'app-great-sock-emergency',
  standalone: true,
  imports: [AssetPlaceholderComponent, ArcadeButtonComponent, RouterLink],
  providers: [GameEngineService],
  templateUrl: './great-sock-emergency.component.html',
  styleUrl: './great-sock-emergency.component.scss',
})
export class GreatSockEmergencyComponent implements OnDestroy {
  @ViewChild('playfield') private readonly playfieldElement?: ElementRef<HTMLDivElement>;
  @ViewChild('player') private readonly playerElement?: ElementRef<HTMLDivElement>;

  protected readonly phase = signal<'intro' | 'playing' | 'result'>('intro');
  protected readonly timeLeft = signal(30);
  protected readonly blackSockCount = signal(0);
  protected readonly whiteSockCount = signal(0);
  protected readonly playerX = signal(50);
  protected readonly fallingSocks = signal<FallingSock[]>([]);
  protected readonly speech = signal<string | null>(null);
  protected readonly outcome = signal<GameOutcome | null>(null);

  private readonly idleMessages = [
    "I'M STARTING TO LOSE FEELING IN MY TOES...",
    'THIS LAUNDRY SITUATION IS GETTING OUT OF HAND.',
  ];
  private readonly heldKeys = new Set<string>();
  private keyboardDirection = 0;
  private activePointerId: number | null = null;
  private frameId: number | null = null;
  private lastFrameAt = 0;
  private lastSpeechAt = 0;
  private speechTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly gameEngine: GameEngineService) {}

  protected startGame(): void {
    this.stopFrame();
    const now = performance.now();
    this.gameEngine.start(now);
    this.phase.set('playing');
    this.timeLeft.set(30);
    this.blackSockCount.set(0);
    this.whiteSockCount.set(0);
    this.playerX.set(50);
    this.fallingSocks.set([]);
    this.outcome.set(null);
    this.speech.set(null);
    this.lastFrameAt = now;
    this.lastSpeechAt = now;
    this.clearDirections();
    this.frameId = requestAnimationFrame(this.advanceGame);
  }

  ngOnDestroy(): void {
    this.stopFrame();
    if (this.speechTimeout !== null) {
      clearTimeout(this.speechTimeout);
    }
  }

  @HostListener('window:keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    if (this.phase() !== 'playing') {
      return;
    }

    const key = event.key.toLowerCase();
    if (key !== 'arrowleft' && key !== 'arrowright' && key !== 'a' && key !== 'd') {
      return;
    }

    event.preventDefault();
    this.heldKeys.add(key);
    this.updateKeyboardDirection();
  }

  @HostListener('window:keyup', ['$event'])
  protected onKeyUp(event: KeyboardEvent): void {
    this.heldKeys.delete(event.key.toLowerCase());
    this.updateKeyboardDirection();
  }

  @HostListener('window:blur')
  protected onWindowBlur(): void {
    this.clearDirections();
  }

  protected startPointerMovement(event: PointerEvent): void {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }

    const field = this.playfieldElement?.nativeElement;
    if (!field) {
      return;
    }

    event.preventDefault();
    this.activePointerId = event.pointerId;
    field.setPointerCapture(event.pointerId);
    this.movePlayerToPointer(event.clientX);
  }

  protected continuePointerMovement(event: PointerEvent): void {
    if (this.activePointerId === event.pointerId) {
      event.preventDefault();
      this.movePlayerToPointer(event.clientX);
    }
  }

  protected endPointerMovement(event: PointerEvent): void {
    if (this.activePointerId === event.pointerId) {
      this.activePointerId = null;
    }
  }

  protected sockAssetKey(sock: FallingSock): ArcadeAssetKey {
    if (sock.kind === 'black') {
      return 'blackSock';
    }
    if (sock.kind === 'white') {
      return 'whiteSock';
    }

    switch (sock.variant) {
      case 'green': return 'greenSock';
      case 'blue': return 'blueSock';
      case 'yellow': return 'yellowSock';
      default: return 'redSock';
    }
  }

  private readonly advanceGame = (now: number): void => {
    if (this.phase() !== 'playing') {
      return;
    }

    const deltaSeconds = Math.min((now - this.lastFrameAt) / 1000, 0.05);
    this.lastFrameAt = now;
    this.playerX.update((position) => Math.max(14, Math.min(86, position + this.keyboardDirection * 58 * deltaSeconds)));

    const tick = this.gameEngine.tick(now, this.playerX(), this.getBasketHitbox());
    this.timeLeft.set(tick.remainingSeconds);
    this.blackSockCount.set(tick.blackSockCount);
    this.whiteSockCount.set(tick.whiteSockCount);
    this.fallingSocks.set(tick.socks);

    if (tick.caughtBlack || tick.caughtWhite) {
      this.showSpeech(tick.blackSockCount >= 5 ? 'EXCELLENT. MY FEET THANK YOU.' : 'YES! A perfectly acceptable sock!', now);
    } else if (tick.missedAcceptableSock) {
      this.showSpeech('NO! COME BACK!', now);
    } else if (now - this.lastSpeechAt >= 9000) {
      const message = this.idleMessages[Math.floor(Math.random() * this.idleMessages.length)];
      this.showSpeech(message, now);
    }

    if (tick.outcome) {
      this.outcome.set(tick.outcome);
      this.phase.set('result');
      this.clearDirections();
      this.frameId = null;
      return;
    }

    this.frameId = requestAnimationFrame(this.advanceGame);
  };

  private showSpeech(message: string, now: number): void {
    this.speech.set(message);
    this.lastSpeechAt = now;
    if (this.speechTimeout !== null) {
      clearTimeout(this.speechTimeout);
    }
    this.speechTimeout = setTimeout(() => this.speech.set(null), 2200);
  }

  private getBasketHitbox(): BasketHitbox {
    const field = this.playfieldElement?.nativeElement;
    const player = this.playerElement?.nativeElement;
    if (!field || !player) {
      return { centerX: this.playerX(), centerY: 80, halfWidth: 5.5, halfHeight: 4 };
    }

    const fieldRect = field.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    const basketLeft = 0.32;
    const basketRight = 0.77;
    const basketTop = 0.37;
    const basketBottom = 0.49;
    const basketWidth = playerRect.width * (basketRight - basketLeft);
    const basketHeight = playerRect.height * (basketBottom - basketTop);

    return {
      centerX: this.playerX() + ((basketLeft + basketRight) / 2 - 0.5) * playerRect.width / fieldRect.width * 100,
      centerY: (playerRect.top - fieldRect.top + playerRect.height * (basketTop + basketBottom) / 2) / fieldRect.height * 100,
      halfWidth: basketWidth * 0.4 / fieldRect.width * 100,
      halfHeight: basketHeight / 2 / fieldRect.height * 100,
    };
  }

  private movePlayerToPointer(clientX: number): void {
    const field = this.playfieldElement?.nativeElement;
    if (!field) {
      return;
    }

    const fieldRect = field.getBoundingClientRect();
    const position = ((clientX - fieldRect.left) / fieldRect.width) * 100;
    this.playerX.set(Math.max(14, Math.min(86, position)));
  }

  private updateKeyboardDirection(): void {
    const left = this.heldKeys.has('arrowleft') || this.heldKeys.has('a');
    const right = this.heldKeys.has('arrowright') || this.heldKeys.has('d');

    if (left === right) {
      this.keyboardDirection = 0;
    } else if (left) {
      this.keyboardDirection = -1;
    } else {
      this.keyboardDirection = 1;
    }
  }

  private clearDirections(): void {
    this.heldKeys.clear();
    this.keyboardDirection = 0;
    this.activePointerId = null;
  }

  private stopFrame(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
}