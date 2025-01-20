import { TestBed } from '@angular/core/testing';
import { SharedCoreService } from '../shared-core.service';

describe('SharedCoreService', () => {
  let service: SharedCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
