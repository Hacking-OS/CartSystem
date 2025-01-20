import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryService } from '../../../services/category.service';


@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent {
  condition:boolean|undefined=false


userData={
  catname:"",
  catId:0,
  catnamenew:"",
  CurrentCatName:""
  }

  checkboxval:any=[];

  message: string | any;
  ipAddress: any;
  usersDataFromDatabase:any;
  userRole= localStorage.getItem('role');
  constructor(private fBuilder: FormBuilder, private Category: CategoryService, private router: Router) {
  if(this.userRole==='user'){
    this.Category.getAllCategoriesForUser(localStorage.getItem("token")).subscribe((data:any)=>{
      this.usersDataFromDatabase=data;
   },(error:any)=>{
    this.usersDataFromDatabase=error.error.message;
   });
  }else{
    this.Category.getAllCategories(localStorage.getItem("token")).subscribe((data:any)=>{
      this.usersDataFromDatabase=data;
   },(error:any)=>{
    this.usersDataFromDatabase=error.error.message;
   });
  }

  }


 display = "none";
 getCatId:any;
openModal(CatUpdate:any,CatName:any) {
    this.display = "block";
    this.getCatId=CatUpdate;
    this.userData.CurrentCatName=CatName;
  }
  onCloseHandled() {
    this.display = "none";
  }


  redirectUser(redirectTo:string){
    this.router.navigateByUrl("/"+redirectTo);
  }

  UpdateCategory(catId:any,FromData:any){
    this.Category.updateCategoryById(catId,localStorage.getItem("token"),this.userData.catnamenew).subscribe((data:any)=>{
    this.message=data.message;
    FromData.reset();
   },(error:any)=>{
    this.message=error.error.message;
   });
   setTimeout(()=>{
     this.message=""||null;

   },3000);
  }

  postData(formData:any):any {
     this.Category.addNewCategory(this.userData.catname,localStorage.getItem("token")).subscribe((data:any)=>{
        this.message=data.message;
     },(error:any)=>{
      this.message=error.error.message;
     });
     formData.reset();
     setTimeout(()=>{
       this.message=""||null;

     },3000);
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
