export const arcadeAssets = {
  philippCharacter: { label: 'Philipp on vacation', path: '/assets/philipp/philipp-arcade.png' },
  philippWetSock: { label: 'Philipp holding a wet sock', path: '/assets/philipp/philipp-wet-sock.png' },
  philippGameCharacter: { label: 'Philipp holding a laundry basket', path: '/assets/philipp/philipp-basket.png' },
  philippTaskDone: { label: 'Philipp with a completed sock supply', path: '/assets/philipp/philipp-task-done.png' },
  philippFailedTask: { label: 'Philipp after the sock emergency', path: '/assets/philipp/philipp-failed-task.png' },
  blackSock: { label: 'Black sock', path: '/assets/games/game-001/socks/black-sock.png' },
  whiteSock: { label: 'White sock', path: '/assets/games/game-001/socks/white-sock.png' },
  redSock: { label: 'Red sock', path: '/assets/games/game-001/socks/red-sock.png' },
  greenSock: { label: 'Green sock', path: '/assets/games/game-001/socks/green-sock.png' },
  blueSock: { label: 'Blue sock', path: '/assets/games/game-001/socks/blue-sock.png' },
  yellowSock: { label: 'Yellow sock', path: '/assets/games/game-001/socks/yellow-sock.png' },
  laundryBasket: { label: 'LAUNDRY_BASKET', path: null as string | null },
} as const;

export type ArcadeAssetKey = keyof typeof arcadeAssets;