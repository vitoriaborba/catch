import { Injectable } from '@angular/core';

export const SPEECH_MESSAGES = {
  acceptableCatch: [
    'A perfectly acceptable sock.',
    "Now we're talking.",
    'Beautiful. Simply beautiful.',
    'One step closer to civilisation.',
    "That's what I call efficiency.",
    'Very good. Carry on.',
    'Ah, a quality item.',
    "See? It's not that difficult.",
    'My standards have been met.',
    'Another one for the collection.',
    'We love a bit of organisation.',
  ],
  miss: [
    'SHIT HAPPENS.',
    'Are you serious?',
    'NO! COME BACK!',
    "Oh, for God's sake.",
    'That was perfectly catchable.',
    'Unbelievable.',
    'I trusted you.',
    "Well, that's unfortunate.",
    'Could you possibly do your job?',
    'This is becoming embarrassing.',
    'Excellent. Just excellent.',
    'I see how it is.',
    'That was not part of the plan.',
    'My disappointment is immeasurable.',
    "We're not doing very well, are we?",
  ],
  colourfulCatch: [
    'WHAT THE HELL IS THAT?!',
    'Absolutely not.',
    'Are you out of your mind?',
    'I specifically said BLACK OR WHITE!',
    'What am I supposed to do with this?!',
    'This is unacceptable.',
    'WHO APPROVED THIS?!',
  ],
  idle: [
    "I'm beginning to question this operation.",
    'Just another day of doing everything myself.',
    'How hard can collecting socks possibly be?',
    'I have a system, you know.',
    'Please remain professional.',
    'I expected better.',
    'This is not particularly efficient.',
    'Can we speed this up?',
    'I really should not have to supervise this.',
    'My patience is running out.',
    'Everything was perfectly organised before this.',
    'I would like to speak to management.',
  ],
  streak: [
    "Now THAT'S efficiency.",
    "We're making progress!",
    'A flawless operation.',
    'Look at us being productive.',
    'Exemplary performance.',
    'I knew I could count on you.',
    'This is how things should be done.',
  ],
} as const;

export type SpeechMessageCategory = keyof typeof SPEECH_MESSAGES;

export const SPEECH_TRIGGER_CHANCES: Record<SpeechMessageCategory, number> = {
  acceptableCatch: 0.7,
  miss: 1,
  colourfulCatch: 1,
  idle: 1,
  streak: 0.82,
};

@Injectable()
export class SpeechMessageService {
  private lastMessage: string | null = null;
  private readonly remainingByCategory = new Map<SpeechMessageCategory, string[]>();

  getMessage(category: SpeechMessageCategory): string | null {
    if (Math.random() >= SPEECH_TRIGGER_CHANCES[category]) {
      return null;
    }

    let remaining = this.remainingByCategory.get(category);
    if (!remaining || remaining.length === 0) {
      remaining = this.shuffle([...SPEECH_MESSAGES[category]]);
      this.remainingByCategory.set(category, remaining);
    }

    let selectedIndex = remaining.length - 1;
    if (remaining[selectedIndex] === this.lastMessage) {
      const alternateIndex = remaining.findIndex((message) => message !== this.lastMessage);
      if (alternateIndex >= 0) {
        selectedIndex = alternateIndex;
      } else {
        remaining = this.shuffle([...SPEECH_MESSAGES[category]]);
        this.remainingByCategory.set(category, remaining);
        selectedIndex = remaining.length - 1;
      }
    }

    const [message] = remaining.splice(selectedIndex, 1);
    this.lastMessage = message;
    return message;
  }

  private shuffle(messages: string[]): string[] {
    for (let index = messages.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [messages[index], messages[swapIndex]] = [messages[swapIndex], messages[index]];
    }

    const lastIndex = messages.length - 1;
    if (messages.length > 1 && messages.at(-1) === this.lastMessage) {
      const alternateIndex = messages.findIndex((message) => message !== this.lastMessage);
      [messages[lastIndex], messages[alternateIndex]] = [messages[alternateIndex], messages[lastIndex]];
    }

    return messages;
  }

  getDisplayDurationMs(): number {
    return 1500 + Math.random() * 1000;
  }

  getNextIdleDelayMs(): number {
    return 10_000 + Math.random() * 5_000;
  }
}