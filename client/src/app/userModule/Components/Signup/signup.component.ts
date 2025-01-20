import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
// import { UserService } from '../../services/userServices/user.service';
import { Router } from '@angular/router';
import { AppComponent } from '../../../app.component';
import { AlertService, AlertType } from '../../../sharedModule/alertServices/alert.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  condition:boolean|undefined=false;


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

  constructor(private fBuilder: FormBuilder, private router: Router, private user:UserService,private alert:AlertService,private appLoader:AppComponent) {
    // this.user.getIpAddress().subscribe((data: any) => (this.ipAddress = data.ip));
    // if(localStorage.getItem('role')!=null||localStorage.getItem('role')!==undefined){
      // window.location.replace("http://192.168.0.38:4200");
      // window.location.replace("http://192.168.0.38:80/cart-system");
    // }
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
  this.appLoader.isLoading=true;
    this.user.insertData({ formValues: this.userData, userIp: this.ipAddress}).subscribe(
        (data: any) => {
          this.alert.showAlert(data.message,AlertType.Success);
          setTimeout(()=>{
            formData.reset();
            this.appLoader.isLoading=false;
            this.router.navigateByUrl("user/login");
          },3000);
        },
        (error: any) => {
          console.log(error);
          // this.message = error.status+error.message;
          this.message = error.error.message;
          formData.reset();
        },
      )
  }

  redirectUser(redirectTo: string) {
    this.router.navigateByUrl('/' + redirectTo);
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
