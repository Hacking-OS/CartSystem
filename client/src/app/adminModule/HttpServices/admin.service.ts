import { inject, Injectable, NgModule } from '@angular/core';
import { AdminEndPointService } from './admin-end-point.service';

@Injectable()
export class AdminService {
  private AdminEndPointService:AdminEndPointService = inject(AdminEndPointService);
  constructor() { }
}
