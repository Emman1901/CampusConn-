import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LadsTabsPage } from './lads-tabs.page';

describe('LadsTabsPage', () => {
  let component: LadsTabsPage;
  let fixture: ComponentFixture<LadsTabsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LadsTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
