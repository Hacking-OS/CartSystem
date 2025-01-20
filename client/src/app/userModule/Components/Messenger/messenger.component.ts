import { NgForm } from '@angular/forms';
import { Component } from '@angular/core';
import { AlertService, AlertType } from '../../../sharedModule/alertServices/alert.service';
import { MessengerService } from '../../services/messenger.service';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})

export class MessengerComponent {
  showMessages:Array<Object|any> | undefined;
  userMessage:string | undefined;
  userId: number | undefined;
constructor(private messageService:MessengerService,private alertService:AlertService){}
ngOnInit(): void {
  this.userId=Number(localStorage.getItem('userId'));
  this.getMessages();
}
sendMessage(form:NgForm){
 this.userMessage;
 let createMessage = () =>{
  return {
    id:localStorage.getItem('userId'),
    email:localStorage.getItem('email'),
    name:localStorage.getItem('userName'),
    message:this.userMessage,
  };
 };
 this.messageService.sendMessage(createMessage()).subscribe((response:any) => {
   this.alertService.showAlert(response.message,AlertType.Success);
   this.getMessages();
   form.reset();
 });
}

deleteMessage(deleteMessageUUID:string){
  this.messageService.deleteMessage(deleteMessageUUID).subscribe((response:any) => {
    this.alertService.showAlert(response.message,AlertType.Success);
    this.getMessages();
  });
}

getMessages(){
  this.messageService.getAllMessages().subscribe((response:any)=>{
    this.showMessages=response;
  });
}
}
