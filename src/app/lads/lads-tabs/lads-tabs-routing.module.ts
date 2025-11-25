import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LadsTabsPage } from './lads-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: LadsTabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'maps',
        loadChildren: () => import('../maps/maps.module').then(m => m.MapsPageModule)
      },
      {
        // Redirect the base /lads path to home
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LadsTabsPageRoutingModule {}