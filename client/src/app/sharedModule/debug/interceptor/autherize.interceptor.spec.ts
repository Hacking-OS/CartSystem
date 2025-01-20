import { TestBed } from '@angular/core/testing';
import { AutherizeInterceptor } from '../../interceptors/autherize.interceptor';

describe('AutherizeInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AutherizeInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: AutherizeInterceptor = TestBed.inject(AutherizeInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
