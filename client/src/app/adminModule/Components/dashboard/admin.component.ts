import { Component } from '@angular/core';
import { AlertService, AlertType } from '../../../sharedModule/alertServices/alert.service';
import { UserService } from '../../../userModule/services/user.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {

AdminviewRights:any|undefined;
userAdmin:any|undefined;
message:any|undefined;
billDetails:any|undefined;

constructor(private user:UserService,private alertService:AlertService){
this.getAdminDetails();
}

changeInput(userId:any,status:any){
  let newStatus=0;
  if(status==true){
    newStatus=0;
  }else{
    newStatus=1;
  }
  this.user.changeUserStatus(userId,localStorage.getItem("token"),newStatus).subscribe((data:any)=>{
    // this.message=data.message;
    this.alertService.showAlert(data.message,AlertType.Success);
    this.getAdminDetails();
    // setTimeout(()=>{
      // this.message=(""||null);
      //
    // },6000);
  },(error:any)=>{
    this.message=error;
  });

}


getMessageClass(status:number) {
  if (status === 1) {
    return 'alert alert-success';
  } else {
    return 'alert alert-warning';
  }
}

getAdminDetails(){
  this.user.getAdminPanel(localStorage.getItem('token')).subscribe((data:any)=>{
    this.AdminviewRights=data;
  },(error:any)=>{
    this.AdminviewRights=error;
    // localStorage.removeItem("token");
    // localStorage.removeItem("role");
  });

  this.user.getBillDetails(localStorage.getItem('token')).subscribe((data:any)=>{
    this.billDetails=data;
  },(error:any)=>{
    this.billDetails=error;
  });
console.log(this.billDetails)
}
}
