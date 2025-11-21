import { Component } from '@angular/core';
import { FormBuilder, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AppComponent } from '../../../app.component';
import { AlertService, AlertType } from '../../../sharedModule/alertServices/alert.service';
import { UserService } from '../../services/user.service';
import { UserSignupDTO, UserSignupResponseDTO, EmailValidationResponseDTO, UserInfoDTO } from '../../../sharedModule/sharedServices/api.dto';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  condition: boolean | undefined = false;

  userData: UserSignupDTO = {
    email: "",
    password: "",
    name: "",
    phone: "",
  };

  checkboxval: string[] = [];

  message: string = '';
  ipAddress: string = '';
  usersDataFromDatabase: UserInfoDTO[] = [];

  constructor(private fBuilder: FormBuilder, private router: Router, private user:UserService,private alert:AlertService,private appLoader:AppComponent) {
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
          this.usersDataFromDatabase = data.recieved;
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

  postData(formData: NgForm): void {
    this.appLoader.isLoading = true;
    this.user.insertData<UserSignupResponseDTO>({ formValues: this.userData, userIp: this.ipAddress }).subscribe({
      next: (data: UserSignupResponseDTO) => {
        this.alert.showAlert(data.message, AlertType.Success);
        setTimeout(() => {
          formData.reset();
          this.appLoader.isLoading = false;
          this.router.navigateByUrl("user/login");
        }, 3000);
      },
      error: (error) => {
        console.log(error);
        const errorMessage = error?.error?.message || 'Unable to sign up. Please try again.';
        this.alert.showAlert(errorMessage, AlertType.Error);
        this.appLoader.isLoading = false;
        formData.reset();
      },
    });
  }

  redirectUser(redirectTo: string): void {
    this.router.navigateByUrl('/' + redirectTo);
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
