import { TestBed } from '@angular/core/testing';

import { UserNotFoundGuard } from '../../guards/user-not-found.guard';

describe('UserNotFoundGuard', () => {
  let guard: UserNotFoundGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UserNotFoundGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
