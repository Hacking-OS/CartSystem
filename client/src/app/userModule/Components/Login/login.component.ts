import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AppComponent } from '../../../app.component';
import { AlertService, AlertType } from '../../../sharedModule/alertServices/alert.service';
import { UserService } from '../../services/user.service';

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

  checkboxval:any=[];

  message: string | any;
  ipAddress: any;
  usersDataFromDatabase:any;

  constructor(private fBuilder: FormBuilder, private router: Router,private alertService:AlertService,private appMain:AppComponent,private user : UserService) {
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



  redirectUser(redirectTo:string){
    this.router.navigateByUrl("/"+redirectTo);
  }




  postData(formData:any):any {
    this.appMain.isLoading=true;
    this.user.loginUser({ formValues: this.userData, userIp: this.ipAddress}).subscribe(
        (data: any) => {
            // this.message = "Login SuccessFully!";
            this.alertService.showAlert("Login Successfully!",AlertType.Success);
            localStorage.setItem("token",data.token);
            localStorage.setItem("role",data.userRole);
            localStorage.setItem("userId",data.userId);
            localStorage.setItem("email",data.email);
            localStorage.setItem("refreshToken",data.refreshToken);
            localStorage.setItem("userName",data.userName);
            setTimeout(()=>{
              // window.location.replace("http://192.168.0.38:8081");
              this.router.navigateByUrl("");
              this.appMain.isLoading=false;
            },4500);
            // window.location.replace("http://192.168.0.38:80/cart-system");
            formData.reset();
        },
        (error: any) => {
          console.log(error);
          // this.message = error.status+error.message;
          // this.message = error.error.message;
          this.alertService.showAlert(error.error.message||error.statusText,AlertType.Error);
          // this.alertService.showAlert("Error Something Went Wrong!",AlertType.Error);
          setTimeout(()=>{
            this.appMain.isLoading=false;
          },4500);
          // this.message = error.error.message;
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
