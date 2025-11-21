import { Component } from '@angular/core';
import { FormBuilder, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AppComponent } from '../../../app.component';
import { AlertService, AlertType } from '../../../sharedModule/alertServices/alert.service';
import { UserService } from '../../services/user.service';
import { SocketService } from '../../../sharedModule/sharedServices/socket.service';
import { UserLoginDTO, EmailValidationResponseDTO, UserInfoDTO } from '../../../sharedModule/sharedServices/api.dto';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  condition:boolean|undefined=false;


userData={
      email:"",
      password:"",
  }

  checkboxval: string[] = [];

  message: string = '';
  ipAddress: string = '';
  usersDataFromDatabase: UserInfoDTO | undefined = undefined;

  constructor(private fBuilder: FormBuilder, private router: Router,private alertService:AlertService,private appMain:AppComponent,private user : UserService,private socketService: SocketService) {
    // this.user.getIpAddress().subscribe((data: any) => (this.ipAddress = data.ip));
    // if(localStorage.getItem('role')!=null||localStorage.getItem('role')!==undefined){
      // window.location.replace("http://192.168.0.38:4200");
      // window.location.replace("http://192.168.0.38:80/cart-system");
    // }
  }



  validate(email: string): void {
    this.user.emailValidate<EmailValidationResponseDTO>(email).subscribe({
      next: (data: EmailValidationResponseDTO) => {
        if (data.recieved && data.recieved.length > 0) {
          this.message = 'Found Email :)<br>';
          this.usersDataFromDatabase = data.recieved[0];
        } else {
          this.message = 'Error This name is not in our Data base please try again!';
        }
      },
      error: (error) => {
        console.log('oops', error);
        this.message = 'Error This name is not in our Data base please try again!';
      },
    });

    setTimeout(() => {
      this.message = '';
    }, 3000);
  }



  redirectUser(redirectTo:string){
    this.router.navigateByUrl("/"+redirectTo);
  }




  postData(formData: NgForm): void {
    this.appMain.isLoading = true;
    this.user.loginUser<UserLoginDTO>({ formValues: this.userData, userIp: this.ipAddress }).subscribe({
      next: (data: UserLoginDTO) => {
            // Store authentication data in localStorage
            if (data.token) {
              localStorage.setItem('token', data.token);
            }
            if (data.userRole) {
              localStorage.setItem('role', data.userRole);
            }
            if (data.userId) {
              localStorage.setItem('userId', data.userId.toString());
            }
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken);
            }
            if (data.userStatus !== undefined) {
              localStorage.setItem('userStatus', data.userStatus.toString());
            }
            
            // Socket.IO will auto-connect via AppComponent initialization
            // Just ensure it connects if not already connected
            this.socketService.connect();
            
            this.alertService.showAlert('Login successful!', AlertType.Success);
            setTimeout(()=>{
              this.appMain.isLoading=false;
              this.router.navigateByUrl("/home");
              formData.reset();
            },4500);
      },
      error: (error) => {
        console.log(error);
        const errorMessage = error?.error?.message || error?.statusText || error?.message || 'Login failed. Please try again.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
        setTimeout(() => {
          this.appMain.isLoading = false;
        }, 4500);
        formData.reset();
      },
    });
  }

  checkboxEventHandler(event: Event): void {
    const target = event.target as HTMLInputElement;
    const lang = this.checkboxval;
    if (target.checked) {
      lang.push(target.value);
    } else {
      const index = lang.findIndex((x: string) => x === target.value);
      if (index > -1) {
        lang.splice(index, 1);
      }
    }
  }
}
