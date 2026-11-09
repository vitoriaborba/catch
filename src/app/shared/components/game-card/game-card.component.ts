import { Component, Input } from '@angular/core';
import { ArcadeButtonComponent } from '../arcade-button/arcade-button.component';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [ArcadeButtonComponent],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
})
export class GameCardComponent {
  @Input({ required: true }) number!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
  @Input({ required: true }) href!: string;
}