import { TestBed } from '@angular/core/testing';

import { PersistenceServiceService } from './persistence-service.service';

describe('PersistenceServiceService', () => {
  let service: PersistenceServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersistenceServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
