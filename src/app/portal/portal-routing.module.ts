import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PortalPage } from './portal.page';


const routes: Routes = [
  {
    path: '',
    component: PortalPage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'maps',
        loadChildren: () => import('./maps/maps.module').then(m => m.MapsPageModule)
      },
      {
        path: 'announcements',
        loadChildren: () => import('./announcements/announcements.module').then(m => m.AnnouncementsPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PortalPageRoutingModule {}
