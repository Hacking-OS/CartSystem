import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertService, AlertType } from '../../../sharedModule/alertServices/alert.service';
import { UserService } from '../../../userModule/services/user.service';
import { SocketService } from '../../../sharedModule/sharedServices/socket.service';
import { AdminUserStatusChangedDTO } from '../../../sharedModule/sharedServices/socket.dto';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

AdminviewRights:any|undefined;
userAdmin:any|undefined;
message:any|undefined;
billDetails:any|undefined;

constructor(
  private user:UserService,
  private alertService:AlertService,
  private socketService: SocketService
){
this.getAdminDetails();
}

ngOnInit(): void {
  // Listen for real-time user status changes from other admins
  this.socketService.onAdminUserStatusChanged((data: AdminUserStatusChangedDTO) => {
    this.alertService.showAlert(
      `User ${data.userName} (${data.userEmail}) status changed to ${data.status === 1 ? 'Approved' : 'Pending'}`,
      AlertType.Info
    );
    // Refresh the admin details to show updated status
    this.getAdminDetails();
  });
}

ngOnDestroy(): void {
  // Clean up socket listeners
  this.socketService.off('admin:userStatusChanged');
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
