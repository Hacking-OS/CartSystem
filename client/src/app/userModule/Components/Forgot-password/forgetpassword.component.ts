import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService, AlertType } from '../../../sharedModule/alertServices/alert.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-forgetpassword',
  templateUrl: './forgetpassword.component.html',
  styleUrls: ['./forgetpassword.component.css']
})
export class ForgetpasswordComponent {
  condition:boolean|undefined=false


  userData={
        email:"",
        password:"",
        name:"",
        phone:"",
    }

    checkboxval:any=[];

    message: string | any;
    ipAddress: any;
    usersDataFromDatabase:any;

    constructor(private fBuilder: FormBuilder, private router: Router, private user : UserService,private alertService:AlertService) {
      this.user.getIpAddress().subscribe((data: any) => (this.ipAddress = data.ip));
    }



    validate(email:string): any {

      this.user.emailValidate(email).subscribe(
        (data: any) => {
          if (data) {
            this.message = 'Found Email :)<br>';
            // console.log(data);
            this.usersDataFromDatabase = data.recieved[0];
          } else {
            this.message = 'Error This name is not in our Data base please try again!';
          }
        },
        (error: any) => {
          console.log('oops', error)
          this.message =
            'Error This name is not in our Data base please try again!'
        },
      )


      setTimeout(() => {
        this.message = ''
      }, 3000)

    }




    postData(formData:any):any {
      this.user.RecoverPassword({ formValues: this.userData, userIp: this.ipAddress}).subscribe(
          (data: any) => {
              // this.message = data.message;
             this.alertService.showAlert(data.message,AlertType.Success);
              formData.reset();
              this.router.navigateByUrl('/login');
          },
          (error: any) => {
            console.log(error);
            // this.message = error.status+error.message;
            // this.message = error.error.message;
            this.alertService.showAlert(error.error.message,AlertType.Error);
            formData.reset();
          },
        )
    }

    checkboxEventHandler(event: any) {
      const lang = this.checkboxval;
      if (event.target.checked) {
        lang.push(event.target.value);
      } else {
        const index = lang.findIndex((x: any) => x === event.target.value);
        lang.splice(index,1);
      }
    }
}
