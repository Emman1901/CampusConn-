import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.page.html',
  styleUrls: ['./portal.page.scss'],
  standalone: false,
})
export class PortalPage implements OnInit {

  constructor() {
    console.log('🚪 Portal page loaded');
  }

  ngOnInit() {
    console.log('🚪 Portal ngOnInit');
  }

}