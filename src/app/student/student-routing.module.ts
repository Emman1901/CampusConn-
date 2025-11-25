import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StudentPage } from './student.page';

const routes: Routes = [
  {
    path: '', // Matches /student
    component: StudentPage, // Loads the page with the ion-tabs and ion-router-outlet
    children: [
      {
        path: '', // Redirects the base /student path to the dashboard
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard', // Matches /student/dashboard
        loadChildren: () =>
          import('./dashboard/dashboard.module').then(
            (m) => m.DashboardPageModule
          ),
      },

      {
        path: 'maps',
        loadChildren: () =>
          import('./maps/maps.module').then((m) => m.MapsPageModule),
      },
      // ADD OTHER CHILD ROUTES HERE for other tabs:
      // {
      //   path: 'schedule', // Matches /student/schedule
      //   loadChildren: () => import('./schedule/schedule.module').then( m => m.SchedulePageModule)
      // },
      // ... and so on for 'announcements' and 'profile'
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentPageRoutingModule {}
