import { Component, Inject, Renderer2, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertService } from './sharedModule/alertServices/alert.service';
import { CspNonceService } from './sharedModule/sharedServices/security/cspnounce.service';
import { CountService } from './adminModule/services/count.service';
import { SocketService } from './sharedModule/sharedServices/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  title = 'CartSystem';
  user = 0;
  isUserAdmin = 0;
  isLoading:boolean=false;
  userRole= localStorage.getItem('role');
  // protected cspPolicy: string = "default-src 'self'; font-src 'self' https://fonts.gstatic.com";
  protected cspPolicy: string = "default-src 'self'; font-src 'self' https://fonts.gstatic.com";

  protected cspNonce: string | undefined;
  constructor(
    private router: Router,
    private renderer: Renderer2,
    private count: CountService,
    private cspNonceService: CspNonceService,
    private alert: AlertService,
    private socketService: SocketService
  ) {
      const nonce = this.cspNonceService.generateNonce();
      this.cspPolicy = `script-src 'self' ${nonce}`;
      this.cspNonceService.generateNonce().then((nonce) => {
        this.cspNonce = nonce;
      });
  }

  ngOnInit(): void {
    // Initialize Socket.IO connection if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      this.socketService.connect();
    }
  }

  redirectUser(redirectTo: string) {
    this.router.navigateByUrl('/' + redirectTo);
  }



}
