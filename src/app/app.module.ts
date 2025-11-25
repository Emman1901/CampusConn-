import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // <-- Ensure FormsModule is here if needed globally

import { AppComponent } from './app.component'; // NOTE: Should be './app.component' if this is the root app.module
import { AppRoutingModule } from './app-routing.module';

// Firebase Imports (Compat)
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment'; // NOTE: Check this path relative to app.module.ts

import { AngularFireAuthModule } from '@angular/fire/compat/auth'; // <-- NEW IMPORT

@NgModule({
  declarations: [AppComponent], // <-- AppComponent DECLARED HERE ONLY
  imports: [
    BrowserModule, // <-- BrowserModule ONLY HERE
    FormsModule, 
    IonicModule.forRoot(), // <-- forRoot() ONLY HERE
    AppRoutingModule,
    
    // Firebase Initialization ONLY HERE
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule, // <-- ADDED AUTH MODULE HERE
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }], // <-- Global Providers ONLY HERE
  bootstrap: [AppComponent], // <-- Global Bootstrap ONLY HERE
})
export class AppModule {}