import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminTabsPage } from './admin-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: AdminTabsPage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'announcements',
        loadChildren: () => import('../announcements/announcements.module').then(m => m.AnnouncementsPageModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
      },
      
      // {
      //   path: 'users',
      //   loadChildren: () => import('../users/users.module').then(m => m.UsersPageModule)
      // },
      
      {
        // Redirect the base /admin path to the admin dashboard
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
export class AdminTabsPageRoutingModule {}