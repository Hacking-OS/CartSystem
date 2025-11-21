import { Component, ElementRef, EventEmitter, Output, Renderer2, Signal, ViewChild, signal } from '@angular/core';
import { FormBuilder, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService, AlertType } from '../../../../sharedModule/alertServices/alert.service';
import { ProductService } from '../../../services/product.service';
import { SharedService } from '../../../../sharedModule/sharedServices/shared.service';
import { ProductDTO, CategoryDTO, ApiResponseDTO } from '../../../../sharedModule/sharedServices/api.dto';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  condition: boolean | undefined = false;
  catDropdown: CategoryDTO[] = [];

  productStatus = signal<Array<boolean | null>>([]);

  userData = {
    catname: "",
    catId: 0,
    catnamenew: "",
    name: "",
    catID: 0,
    description: "",
    price: 0,
    ProductId: 0,
    name2: "",
    catID2: 0,
    description2: "",
    price2: 0,
    ProductId2: 0
  };

  checkboxval: string[] = [];
  isUserSeeGrid: boolean = false;
  message: string = '';
  ipAddress: string = '';
  usersDataFromDatabase: ProductDTO[] = [];

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


  changeInput(userId: number, status: number | boolean): void {
    // Convert status to boolean if it's a number (0 = false, 1 = true)
    const statusBool = typeof status === 'number' ? status === 1 : status;
    const newStatus = statusBool ? 0 : 1;
    this.productStatus.update((values) => {
      const index = this.usersDataFromDatabase.findIndex((x: ProductDTO) => x.id === userId);
      const newValues = [...values];
      newValues[index] = newStatus === 1 ? true : false;
      return newValues;
    });
    this.product.changeStatus<ApiResponseDTO>(userId, newStatus).subscribe({
      next: (data: ApiResponseDTO) => {
        this.message = data.message || 'Status updated';
        this.alertService.showAlert(this.message, AlertType.Success);
        this.getProducts();
        setTimeout(() => {
          this.message = "";
        }, 3000);
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Unable to update product status.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
        setTimeout(() => {
          this.message = "";
        }, 3000);
      },
    });
  }

  display = "none";
  productData: {
    ProductId: number;
    productName: string;
    productDescription: string;
    productPrice: number;
    categoryId: number;
  } | null = null;

  openModal(CatUpdate: number, productName: string, productDescription: string | undefined, productPrice: number, categoryId: number): void {
    this.display = "block";
    this.productData = {
      ProductId: CatUpdate,
      productName: productName,
      productDescription: productDescription || '',
      productPrice: productPrice,
      categoryId: categoryId,
    };
    this.userData.catID2 = this.productData.categoryId;
    this.userData.ProductId2 = this.productData.ProductId;
    this.userData.price2 = this.productData.productPrice;
    this.userData.name2 = this.productData.productName;
    this.userData.description2 = this.productData.productDescription;
  }

  onCloseHandled(): void {
    this.display = "none";
  }

  redirectUser(redirectTo: string): void {
    this.router.navigateByUrl("/" + redirectTo);
  }

  UpdateProduct(productId: number, FromData: NgForm): void {
    this.userData.ProductId = productId;
    this.product.updateProductById<ApiResponseDTO>(this.userData, localStorage.getItem("token") || '').subscribe({
      next: (data: ApiResponseDTO) => {
        this.message = data.message || 'Product updated successfully';
        this.alertService.showAlert(this.message, AlertType.Success);
        this.getProducts();
        if (this.display === "block") {
          this.onCloseHandled();
          this.getCount.scrollToNav();
        }
        FromData.reset();
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Unable to update product.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
      },
    });
    setTimeout(() => {
      this.message = "";
    }, 3000);
  }

  productDelete(ProductId: number): void {
    this.product.deleteProductById<ApiResponseDTO>(ProductId).subscribe({
      next: (data: ApiResponseDTO) => {
        this.message = data.message || 'Product deleted successfully';
        this.alertService.showAlert(this.message, AlertType.Success);
        this.getProducts();
        this.getCount.scrollToNav();
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Unable to delete product.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
      },
    });
    setTimeout(() => {
      this.message = "";
    }, 3000);
  }

  postData(formData: NgForm): void {
    this.product.addNewProduct<ApiResponseDTO>(this.userData, localStorage.getItem("token")).subscribe({
      next: (data: ApiResponseDTO) => {
        this.message = data.message || 'Product added successfully';
        this.alertService.showAlert(this.message, AlertType.Success);
        this.getProducts();
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Unable to add product.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
      },
    });
    formData.reset();
    setTimeout(() => {
      this.message = "";
    }, 3000);
  }

  addToCart(productPrice: number, productId: number): void {
    this.product.addToCart<ApiResponseDTO>(productPrice, productId).subscribe({
      next: (data: ApiResponseDTO) => {
        this.message = data.message || 'Added to cart successfully';
        this.alertService.showAlert(this.message, AlertType.Success);
        this.getCount.getUserCount();
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Unable to add to cart.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
        this.getCount.scrollToNav();
      },
    });
    setTimeout(() => {
      this.message = "";
    }, 3000);
  }

  checkboxEventHandler(event: Event): void {
    const target = event.target as HTMLInputElement;
    const lang = this.checkboxval;
    if (target.checked) {
      lang.push(target.value);
    } else {
      const index = lang.findIndex((x: string) => x === target.value);
      if (index > -1) {
        lang.splice(index, 1);
      }
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

  getProducts(): void {
    if (this.userRole === 'user') {
      this.product.getAllProductsForUser<ProductDTO[]>().subscribe({
        next: (data: ProductDTO[]) => {
          this.usersDataFromDatabase = data;
          this.productStatus.update(() => []);
          this.productStatus.update((values) => {
            const newValues = [...values];
            for (let i = 0; i < this.usersDataFromDatabase?.length; i++) {
              newValues[i] = this.usersDataFromDatabase[i].status === 1 ? true : false;
            }
            return newValues;
          });
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Unable to load products.';
          this.alertService.showAlert(errorMessage, AlertType.Error);
        },
      });
      this.product.getAllCategoriesForUser<CategoryDTO[]>().subscribe({
        next: (data: CategoryDTO[]) => {
          this.catDropdown = data;
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Unable to load categories.';
          this.alertService.showAlert(errorMessage, AlertType.Error);
        },
      });
    } else {
      this.product.getAllProducts<ProductDTO[]>().subscribe({
        next: (data: ProductDTO[]) => {
          this.usersDataFromDatabase = data;
          this.productStatus.update(() => []);
          this.productStatus.update((values) => {
            const newValues = [...values];
            for (let i = 0; i < this.usersDataFromDatabase?.length; i++) {
              newValues[i] = this.usersDataFromDatabase[i].status === 1 ? true : false;
            }
            return newValues;
          });
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Unable to load products.';
          this.alertService.showAlert(errorMessage, AlertType.Error);
        },
      });
      this.product.getAllCategories<CategoryDTO[]>().subscribe({
        next: (data: CategoryDTO[]) => {
          this.catDropdown = data;
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Unable to load categories.';
          this.alertService.showAlert(errorMessage, AlertType.Error);
        },
      });
    }
  }


}
