import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-arcade-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './arcade-header.component.html',
  styleUrl: './arcade-header.component.scss',
})
export class ArcadeHeaderComponent {}