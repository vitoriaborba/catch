import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AssetPlaceholderComponent } from '../../../../shared/components/asset-placeholder/asset-placeholder.component';
import { ArcadeButtonComponent } from '../../../../shared/components/arcade-button/arcade-button.component';

@Component({
  selector: 'app-great-sock-emergency',
  standalone: true,
  imports: [AssetPlaceholderComponent, ArcadeButtonComponent, RouterLink],
  templateUrl: './great-sock-emergency.component.html',
  styleUrl: './great-sock-emergency.component.scss',
})
export class GreatSockEmergencyComponent {
  protected showComingSoon = false;
}