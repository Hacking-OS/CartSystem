import { Component, ElementRef, EventEmitter, Output, Renderer2, Signal, ViewChild, signal } from '@angular/core';
import { FormBuilder, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService, AlertType } from '../../../../sharedModule/alertServices/alert.service';
import { ProductService } from '../../../services/product.service';
import { SharedService } from '../../../../sharedModule/sharedServices/shared.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  condition:boolean|undefined=false;
  catDropdown:any|undefined;

  // @Output() newItemEvent = new EventEmitter<string>();
  // @ViewChild('navbar') navbar!: ElementRef;
  productStatus=signal<Array<boolean|null>>([]);

userData={
  catname:"",
  catId:0,
  catnamenew:"",
  name:"",
  catID:0,
  description:"",
  price:0,
  ProductId:0,
  name2:"",
  catID2:0,
  description2:"",
  price2:0,
  ProductId2:0
  }

  checkboxval:any=[];
  isUserSeeGrid:boolean=false;
  message: string | any;
  ipAddress: any;
  usersDataFromDatabase:any;

userRole= localStorage.getItem('role');

  constructor(private fBuilder: FormBuilder, private product:ProductService, private router: Router,
    private getCount:SharedService,
    private alertService:AlertService,
    ) {
    this.getProducts();

  }

onClickChange(){
  this.isUserSeeGrid=!this.isUserSeeGrid;
}


  changeInput(userId:any,status:any){
    let newStatus=0;
    if(status==true){
      newStatus=0;
    }else{
      newStatus=1;
    }
    // ()=>(newStatus==1)?true:false
    let getIndex  = this.usersDataFromDatabase.find((x:any)=>x.id===userId);
    // this.productStatus.update((getIndex)=>[(newStatus==1)?true:false]);
    this.productStatus.update ((values) => {
      // find the index of the user in the array
      let index = this.usersDataFromDatabase.findIndex ((x: any) => x.id === userId);
      // create a copy of the array
      let newValues = [...values];
      newValues[index] =  newStatus === 1 ? true : false;
      //  for (var i = 0; i < this.usersDataFromDatabase?.length; i++) {
      //     newValues[i] = this.usersDataFromDatabase[i].status === 1 ? true : false;
      //   }
      // return the new array
      return newValues;
      });
    this.product.changeStatus(userId,localStorage.getItem("token"),newStatus).subscribe((data:any)=>{
      this.message=data.message;
      this.getProducts();
      setTimeout(()=>{
        this.message="";
        //
       },3000);
    },(error:any)=>{
      this.message=error;
      setTimeout(()=>{
         this.message="";

       },3000);
    });

  }

 display = "none";
 productData:any;
openModal(CatUpdate:any,productName:any,productDescription:any,productPrice:any,categoryId:any) {
  // ,person.name,person.description,person.price
    this.display = "block";
    this.productData={
      ProductId:CatUpdate,
      productName:productName,
      productDescription:productDescription,
      productPrice:productPrice,
      categoryId:categoryId,
    };
    this.userData.catID2=this.productData.categoryId;
    this.userData.ProductId2=this.productData.ProductId;
    this.userData.price2=this.productData.productPrice;
    this.userData.name2=this.productData.productName;
    this.userData.description2=this.productData.productDescription;
  }
  onCloseHandled() {
    this.display = "none";
  }


  redirectUser(redirectTo:string){
    this.router.navigateByUrl("/"+redirectTo);
  }

  UpdateProduct(productId:any,FromData:any){
    this.userData.ProductId=productId;
    this.product.updateProductById(this.userData,localStorage.getItem("token")).subscribe((data:any)=>{
      this.message=data.message;
      this.getProducts();
      if(this.display === "block"){
        this.onCloseHandled();
        this.getCount.scrollToNav();
      }
      FromData.reset();
     },(error:any)=>{
      this.message=error.error.message;
     });
     setTimeout(()=>{
       this.message="";

     },3000);
  }
  productDelete(ProductId:any){
    this.product.deleteProductById(ProductId,localStorage.getItem("token")).subscribe((data:any)=>{
      this.message=data.message;
      this.getProducts();
      this.getCount.scrollToNav();
   },(error:any)=>{
    this.message=error.error.message;
   });
   setTimeout(()=>{
     this.message="";

   },3000);
  }

  postData(formData:any):any {
    this.product.addNewProduct(this.userData,localStorage.getItem("token")).subscribe((data:any)=>{
      this.message=data.message;
      this.getProducts();
   },(error:any)=>{
    this.message=error.error.message;
   });
   formData.reset();
   setTimeout(()=>{
     this.message="";
   },3000);
  }

  addToCart(productPrice:number,productId:number){
    this.product.addToCart(localStorage.getItem("token"),productPrice,productId).subscribe((data:any)=>{
      this.message=data.message;
      this.getCount.getUserCount();
   },(error:any)=>{
    this.message=error.error.message;
    this.getCount.scrollToNav();
   });
   setTimeout(()=>{
     this.message="";
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

  getMessageClass() {
    if (this.message === 'Updated To Cart successfully !') {
         this.alertService.showAlert(this.message,AlertType.Info);
      return 'alert alert-info';
    } else if (this.message === 'Added To Cart successfully !'||'Product registered successfully !') {
      this.alertService.showAlert(this.message,AlertType.Success);
      return 'alert alert-success';
    } else {
      return '';
    }
  }

  getProducts(){
    if(this.userRole==='user'){
      this.product.getAllProductsForUser(localStorage.getItem("token")).subscribe((data:any)=>{
        this.usersDataFromDatabase=data;
      this.productStatus.update(() => []);
      this.productStatus.update((values) => {
        // find the index of the user in the array
        let newValues = [...values];
        for (var i = 0; i < this.usersDataFromDatabase?.length; i++) {
          // set the value at the corresponding index based on the status property
          newValues[i] = this.usersDataFromDatabase[i].status === 1 ? true : false;
          }
        return newValues;
        });
     },(error:any)=>{
      this.usersDataFromDatabase=error.error.message;
     });
      this.product.getAllCategoriesForUser(localStorage.getItem("token")).subscribe((data:any)=>{
        this.catDropdown=data;
     },(error:any)=>{
      this.catDropdown=error.error.message;
     });
    }else{
      this.product.getAllProducts(localStorage.getItem("token")).subscribe((data:any)=>{
        this.usersDataFromDatabase=data;
      //   for(var i=0;i == this.usersDataFromDatabase?.length;i++){
      //     this.productStatus.set([(this.usersDataFromDatabase[i].status===1)?true:false]);
      // }
      this.productStatus.update(() => []);
      this.productStatus.update((values) => {
        // find the index of the user in the array
        let newValues = [...values];
        for (var i = 0; i < this.usersDataFromDatabase?.length; i++) {
          // set the value at the corresponding index based on the status property
          newValues[i] = this.usersDataFromDatabase[i].status === 1 ? true : false;
          }
        return newValues;
        });
     },(error:any)=>{
      this.usersDataFromDatabase=error.error.message;
     });
      this.product.getAllCategories(localStorage.getItem("token")).subscribe((data:any)=>{
        this.catDropdown=data;
     },(error:any)=>{
      this.catDropdown=error.error.message;
     });


    }
  }


}
