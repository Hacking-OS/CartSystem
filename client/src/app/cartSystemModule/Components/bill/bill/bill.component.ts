import { Component } from '@angular/core';
import { BillService } from '../../../services/bill.service';


@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.css']
})
export class BillComponent {
  message:any|undefined;
  show:any;

  userRole=localStorage.getItem('role');
  constructor(private bill:BillService){
    if(localStorage.getItem('role')==="user"){
      bill.getAllUserBill(localStorage.getItem("token")).subscribe(
        (data:any)=>{
          this.show=data;
         },(error:any)=>{
          this.message=error.error.message;
         });
      }else{
      bill.getAllConsumerBill(localStorage.getItem("token")).subscribe(
        (data:any)=>{
          this.show=data;
         },(error:any)=>{
          this.message=error.error.message;
         });
      }
    }

    deleteBill(id:any){
            this.bill.deleteBill(id,localStorage.getItem("token")).subscribe(
              (data:any)=>{
                this.message=data.message;
               },(error:any)=>{
                this.message=error.error.message;
               });
               setTimeout(()=>{
                 this.message="";

               },3000);
    }

    GenerateReport(id:any){
     this.bill.generateReport(id,localStorage.getItem("token")).subscribe(
              (data:any)=>{
                this.message=data.message;
               },(error:any)=>{
                this.message=error.error.message;
               });
               setTimeout(()=>{
                 this.message="";

               },3000);
    }

    getPdf(id:any){
      this.bill.getPdf(id,localStorage.getItem("token"),localStorage.getItem('role')).subscribe(data=>{
          var file = new Blob([data], { type: 'application/pdf' });
          var fileURL = URL.createObjectURL(file);
          window.open(fileURL);
          //this.message=data;
         });
        //  setTimeout(()=>{
        //   this.message="";
        //
        //  },3000);
    }
}
