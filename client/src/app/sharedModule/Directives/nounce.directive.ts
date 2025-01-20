import { Directive, ElementRef, Renderer2, OnInit } from '@angular/core';
import { CspNonceService } from "../security/cspnounce.service";

@Directive({
  selector: '[appCspNonce]',
})
export class CspNonceDirective implements OnInit {
  constructor(
    private elementRef : ElementRef,
    private renderer: Renderer2,
    private cspNonceService: CspNonceService
  ) {}

  ngOnInit(): void {
    this.cspNonceService.generateNonce().then((nonce) => {
      // Set the CSP nonce attribute on the element
      this.renderer.setAttribute(this.elementRef.nativeElement, 'csp-nonce', nonce);
    });
  }
}
