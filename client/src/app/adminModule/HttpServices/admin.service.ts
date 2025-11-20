import { inject, Injectable, NgModule } from '@angular/core';
import { AdminEndPointService } from './admin-end-point.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SharedService } from '../../sharedModule/sharedServices/shared.service';

@Injectable()
export class AdminService {
  private AdminEndPointService:AdminEndPointService;
  constructor() { 
    this.AdminEndPointService = new AdminEndPointService(inject(HttpClient),inject(Router),inject(SharedService));
  }
}
