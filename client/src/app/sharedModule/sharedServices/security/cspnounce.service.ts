// // import { Injectable } from '@angular/core';
// // import * as crypto from 'crypto';
// // // import * as crypto from 'crypto-js';
// // @Injectable({
// //   providedIn: 'root',
// // })
// // export class CspNonceService {
// //   generateNonce(): string {
// //     const nonce = crypto.randomBytes(16).toString('base64');
// //     return `'nonce-${nonce}'`;
// //   }
// // }
// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class CspNonceService {
//   async generateNonce(): Promise<string> {
//     try {
//       // Check if the Web Crypto API is available
//       if (window.crypto && window.crypto.subtle) {
//         const randomBytes = new Uint8Array(16);
//         await window.crypto.getRandomValues(randomBytes);
//         const encoder = new TextEncoder();
//         const data = encoder.encode(String.fromCharCode(...randomBytes));
//         const nonce = btoa(String.fromCharCode(...data));
//         return `'nonce-${nonce}'`;
//       } else {
//         throw new Error('Web Crypto API is not available in this browser.');
//       }
//     } catch (error) {
//       console.error('Error generating nonce:', error);
//       // Handle the error as needed
//       return '';
//     }
//   }
// }
// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class CspNonceService {
//   async generateNonce(): Promise<string> {
//     try {
//       // Check if the Web Crypto API is available
//       if (window.crypto && window.crypto.subtle) {
//         const randomBytes = new Uint8Array(16);
//         await window.crypto.getRandomValues(randomBytes);
//         const nonce = btoa(String.fromCharCode(...randomBytes));
//         return `'nonce-${nonce}'`;
//       } else {
//         throw new Error('Web Crypto API is not available in this browser.');
//       }
//     } catch (error) {
//       console.error('Error generating nonce:', error);
//       // Handle the error as needed
//       return '';
//     }
//   }
// }

import { Injectable, NgModule } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class CspNonceService {
  async generateNonce(): Promise<string> {
    try {
      // Check if the Web Crypto API is available
      if (window.crypto && window.crypto.subtle) {
        const randomBytes = new Uint8Array(16);
        await window.crypto.getRandomValues(randomBytes);
        const encoder = new TextEncoder();
        const data = encoder.encode(String.fromCharCode(...randomBytes));
        const nonce = btoa(String.fromCharCode(...data));
        return `'nonce-${nonce}'`;
      } else {
        // Fallback for browsers without Web Crypto API support
        const randomBytes = new Array(16)
          .fill(0)
          .map(() => Math.floor(Math.random() * 256));
        const nonce = CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.create(randomBytes));
        return `'nonce-${nonce}'`;
      }
    } catch (error) {
      console.error('Error generating nonce:', error);
      // Handle the error as needed
      return '';
    }
  }
}


