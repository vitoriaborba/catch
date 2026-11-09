import { Component } from '@angular/core';
import { AssetPlaceholderComponent } from '../../shared/components/asset-placeholder/asset-placeholder.component';
import { GameCardComponent } from '../../shared/components/game-card/game-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AssetPlaceholderComponent, GameCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}