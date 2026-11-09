import { Component, Input } from '@angular/core';
import { arcadeAssets, ArcadeAssetKey } from '../../assets/arcade-assets';

export type AssetRatio = 'portrait' | 'landscape' | 'sock' | 'square';

@Component({
  selector: 'app-asset-placeholder',
  standalone: true,
  templateUrl: './asset-placeholder.component.html',
  styleUrl: './asset-placeholder.component.scss',
})
export class AssetPlaceholderComponent {
  @Input({ required: true }) assetKey!: ArcadeAssetKey;
  @Input() ratio: AssetRatio = 'portrait';

  protected get asset() {
    return arcadeAssets[this.assetKey];
  }
}