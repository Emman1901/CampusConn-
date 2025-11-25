import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Correct module for feature modules
import { FormsModule } from '@angular/forms'; // <-- Required for ngModel

import { IonicModule } from '@ionic/angular'; // <-- Use just IonicModule, NOT forRoot()

import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';

// 1. **CRITICAL FIX: REMOVE ALL GLOBAL APP IMPORTS**
// No BrowserModule, No AppRoutingModule, No Firebase Config, No Providers, No Bootstrap

@NgModule({
  // declarations: Contains components/pages that belong to this module
  declarations: [HomePage], 
  imports: [
    CommonModule,
    FormsModule,
    IonicModule, // <-- Just IonicModule here
    HomePageRoutingModule,
  ]
})
export class HomePageModule {}