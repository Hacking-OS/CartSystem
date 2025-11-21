
import { Component, Signal, computed, effect, signal, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { FormBuilder, FormControl, FormGroup, NgForm } from '@angular/forms';
import { empInterface } from './interface/home.interface';
import { AlertService, AlertType } from '../../alertServices/alert.service';
import { RefreshtokenService } from '../../interceptors/refreshtoken.service';
import { SocketService } from '../../sharedServices/socket.service';
import { ApprovalStatusChangedDTO } from '../../sharedServices/socket.dto';




@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  usersDataFromDatabase:any;
  catDropdown:any;
  userRole=localStorage.getItem('role');
  safeHtmlContent!:SafeHtml;

  firstName=signal<string>("John");
  lastName=signal<string>("Fernandaz");
  fullName = computed<string>(()=> this.firstName()+" " + this.lastName());

  quantity = signal<number>(5);

  employees = signal<Array<empInterface>>([
 { name:"John Wick",position:"Manager",department:"Manager"},
]);

employeeForm!:FormGroup;

constructor(
  private getToken:RefreshtokenService,
  private alertService:AlertService,
  private sanitizer: DomSanitizer,
  private fb: FormBuilder,
  private socketService: SocketService
  ){

}

ngOnInit(): void {
 this.employeeForm=this.fb.group({
   name:new FormControl(''),
   position:new FormControl(''),
   department:new FormControl(''),
 });
 
 // Listen for approval notifications
 this.socketService.onApprovalStatusChanged((data: ApprovalStatusChangedDTO) => {
   if (data.approved) {
     this.alertService.showAlert(data.message, AlertType.Success);
   } else {
     this.alertService.showAlert(data.message, AlertType.Warning);
   }
 });
}

ngOnDestroy(): void {
  this.socketService.off('approval:statusChanged');
}


changeFirstName(name:string):void {
  this.firstName.set(name);
}
changeLastName(name:string):void {
  this.lastName.set(name);
}


add(){
  this.quantity.update(q=>q+1);
}
remove(){
  if(this.quantity()<=0){
    this.alertService.showAlert("value must be greater than 0",AlertType.Error);
  }else{
    this.quantity.update(q=>q-1);
  }
}

sideEffect = effect(()=>console.log("Some thing has changed : " + JSON.stringify(this.employees()[this.employees().length - 1])));

addEmployee():void {
  console.log(this.employeeForm.value);
  this.employees.update((empList: any) => [...empList, this.employeeForm.value]);
}




showmessage(showMessage:string):void {
  switch (showMessage) {
    case "Error":
      this.alertService.showAlertPopup("Error!","Error Message",AlertType.Error);
      break;
    case "Success":
      this.alertService.showAlertPopup("Success!","Success Message",AlertType.Success);
      break;
    case "Warning":
      this.alertService.showAlertPopup("Warning!","Warning Message",AlertType.Warning);
      break;
    case "Info":
      this.alertService.showAlertPopup("Info!","Info Message",AlertType.Info);
      break;
}
const unsafeHtml = '<script>Alert("Hello World")</script> 4530643968';
this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(unsafeHtml);
 }
}