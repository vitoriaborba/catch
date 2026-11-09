import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-arcade-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './arcade-button.component.html',
  styleUrl: './arcade-button.component.scss',
})
export class ArcadeButtonComponent {
  @Input() href: string | null = null;
  @Input() disabled = false;
  @Output() activated = new EventEmitter<void>();
}