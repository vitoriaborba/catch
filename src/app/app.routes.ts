import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { GreatSockEmergencyComponent } from './features/games/game-001/great-sock-emergency/great-sock-emergency.component';

export const routes: Routes = [
	{ path: '', component: HomeComponent, title: "Philipp's Arcade" },
	{
		path: 'games/001',
		component: GreatSockEmergencyComponent,
		title: "The Great Sock Emergency | Philipp's Arcade",
	},
	{ path: '**', redirectTo: '' },
];
