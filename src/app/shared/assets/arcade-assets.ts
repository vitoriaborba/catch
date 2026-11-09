export const arcadeAssets = {
  philippCharacter: { label: 'PHILIPP_CHARACTER', path: null as string | null },
  philippWetSock: { label: 'PHILIPP_WET_SOCK', path: null as string | null },
  philippGameCharacter: { label: 'PHILIPP_GAME_CHARACTER', path: null as string | null },
  blackSock: { label: 'BLACK_SOCK', path: null as string | null },
  colourfulSock: { label: 'COLOURFUL_SOCK', path: null as string | null },
  laundryBasket: { label: 'LAUNDRY_BASKET', path: null as string | null },
} as const;

export type ArcadeAssetKey = keyof typeof arcadeAssets;