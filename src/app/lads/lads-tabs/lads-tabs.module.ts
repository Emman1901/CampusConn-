import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LadsTabsPageRoutingModule } from './lads-tabs-routing.module';

import { LadsTabsPage } from './lads-tabs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LadsTabsPageRoutingModule
  ],
  declarations: [LadsTabsPage]
})
export class LadsTabsPageModule {}
