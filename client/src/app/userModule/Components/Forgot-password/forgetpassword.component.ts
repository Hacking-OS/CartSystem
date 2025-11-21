import { Component } from '@angular/core';
import { FormBuilder, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService, AlertType } from '../../../sharedModule/alertServices/alert.service';
import { UserService } from '../../services/user.service';
import { UserSignupDTO, PasswordRecoveryResponseDTO, EmailValidationResponseDTO, UserInfoDTO } from '../../../sharedModule/sharedServices/api.dto';

@Component({
  selector: 'app-forgetpassword',
  templateUrl: './forgetpassword.component.html',
  styleUrls: ['./forgetpassword.component.css']
})
export class ForgetpasswordComponent {
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

    constructor(private fBuilder: FormBuilder, private router: Router, private user : UserService,private alertService:AlertService) {
      this.user.getIpAddress().subscribe((data: any) => (this.ipAddress = data.ip));
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
    this.user.RecoverPassword<PasswordRecoveryResponseDTO>({ formValues: this.userData, userIp: this.ipAddress }).subscribe({
      next: (data: PasswordRecoveryResponseDTO) => {
        this.alertService.showAlert(data.message, AlertType.Success);
        formData.reset();
        this.router.navigateByUrl('/user/login');
      },
      error: (error) => {
        console.log(error);
        const errorMessage = error?.error?.message || 'Unable to recover password. Please try again.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
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
