import { Component } from '@angular/core';
import { FormBuilder, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { CategoryDTO, ApiResponseDTO } from '../../../../sharedModule/sharedServices/api.dto';
import { AlertService, AlertType } from '../../../../sharedModule/alertServices/alert.service';


@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent {
  condition: boolean | undefined = false;

  userData = {
    catname: "",
    catId: 0,
    catnamenew: "",
    CurrentCatName: ""
  };

  checkboxval: string[] = [];

  message: string = '';
  ipAddress: string = '';
  usersDataFromDatabase: CategoryDTO[] = [];
  userRole = localStorage.getItem('role');

  constructor(
    private fBuilder: FormBuilder,
    private Category: CategoryService,
    private router: Router,
    private alertService: AlertService
  ) {
    if (this.userRole === 'user') {
      this.Category.getAllCategoriesForUser<CategoryDTO[]>().subscribe({
        next: (data: CategoryDTO[]) => {
          this.usersDataFromDatabase = data;
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Unable to load categories.';
          this.alertService.showAlert(errorMessage, AlertType.Error);
        },
      });
    } else {
      this.Category.getAllCategories<CategoryDTO[]>().subscribe({
        next: (data: CategoryDTO[]) => {
          this.usersDataFromDatabase = data;
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Unable to load categories.';
          this.alertService.showAlert(errorMessage, AlertType.Error);
        },
      });
    }
  }

  display = "none";
  getCatId: number = 0;

  openModal(CatUpdate: number, CatName: string): void {
    this.display = "block";
    this.getCatId = CatUpdate;
    this.userData.CurrentCatName = CatName;
  }

  onCloseHandled(): void {
    this.display = "none";
  }

  redirectUser(redirectTo: string): void {
    this.router.navigateByUrl("/" + redirectTo);
  }

  UpdateCategory(catId: number, FromData: NgForm): void {
    this.Category.updateCategoryById<ApiResponseDTO>(catId, localStorage.getItem("token"), this.userData.catnamenew).subscribe({
      next: (data: ApiResponseDTO) => {
        this.message = data.message || 'Category updated successfully';
        this.alertService.showAlert(this.message, AlertType.Success);
        FromData.reset();
        // Reload categories
        if (this.userRole === 'user') {
          this.Category.getAllCategoriesForUser<CategoryDTO[]>().subscribe({
            next: (data: CategoryDTO[]) => {
              this.usersDataFromDatabase = data;
            },
          });
        } else {
          this.Category.getAllCategories<CategoryDTO[]>().subscribe({
            next: (data: CategoryDTO[]) => {
              this.usersDataFromDatabase = data;
            },
          });
        }
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Unable to update category.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
      },
    });
    setTimeout(() => {
      this.message = "";
    }, 3000);
  }

  postData(formData: NgForm): void {
    this.Category.addNewCategory<ApiResponseDTO>(this.userData.catname, localStorage.getItem("token")).subscribe({
      next: (data: ApiResponseDTO) => {
        this.message = data.message || 'Category added successfully';
        this.alertService.showAlert(this.message, AlertType.Success);
        // Reload categories
        if (this.userRole === 'user') {
          this.Category.getAllCategoriesForUser<CategoryDTO[]>().subscribe({
            next: (data: CategoryDTO[]) => {
              this.usersDataFromDatabase = data;
            },
          });
        } else {
          this.Category.getAllCategories<CategoryDTO[]>().subscribe({
            next: (data: CategoryDTO[]) => {
              this.usersDataFromDatabase = data;
            },
          });
        }
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Unable to add category.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
      },
    });
    formData.reset();
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
}
