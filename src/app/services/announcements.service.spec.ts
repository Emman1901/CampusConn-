import { TestBed } from '@angular/core/testing';

import { Announcements } from './announcements.service';

describe('Announcements', () => {
  let service: Announcements;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Announcements);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
