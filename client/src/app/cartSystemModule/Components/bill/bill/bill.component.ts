import { Component } from '@angular/core';
import { BillService } from '../../../services/bill.service';
import { BillDTO, ApiResponseDTO } from '../../../../sharedModule/sharedServices/api.dto';
import { AlertService, AlertType } from '../../../../sharedModule/alertServices/alert.service';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.css'],
})
export class BillComponent {
  message: string = '';
  show: BillDTO[] = [];

  userRole = localStorage.getItem('role');

  constructor(
    private bill: BillService,
    private alertService: AlertService
  ) {
    if (localStorage.getItem('role') === 'user') {
      bill.getAllUserBill<BillDTO[]>(localStorage.getItem('token')).subscribe({
        next: (data: BillDTO[]) => {
          this.show = data;
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Unable to load bills.';
          this.alertService.showAlert(errorMessage, AlertType.Error);
        },
      });
    } else {
      bill.getAllConsumerBill<BillDTO[]>(localStorage.getItem('token')).subscribe({
        next: (data: BillDTO[]) => {
          this.show = data;
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Unable to load bills.';
          this.alertService.showAlert(errorMessage, AlertType.Error);
        },
      });
    }
  }

  deleteBill(id: string): void {
    this.bill.deleteBill<ApiResponseDTO>(id, localStorage.getItem('token')).subscribe({
      next: (data: ApiResponseDTO) => {
        this.message = data.message || 'Bill deleted successfully';
        this.alertService.showAlert(this.message, AlertType.Success);
        // Reload bills
        if (this.userRole === 'user') {
          this.bill.getAllUserBill<BillDTO[]>(localStorage.getItem('token')).subscribe({
            next: (data: BillDTO[]) => {
              this.show = data;
            },
          });
        } else {
          this.bill.getAllConsumerBill<BillDTO[]>(localStorage.getItem('token')).subscribe({
            next: (data: BillDTO[]) => {
              this.show = data;
            },
          });
        }
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Unable to delete bill.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
      },
    });
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  GenerateReport(id: string): void {
    this.bill.generateReport<ApiResponseDTO>(id, localStorage.getItem('token')).subscribe({
      next: (data: ApiResponseDTO) => {
        this.message = data.message || 'Report generated successfully';
        this.alertService.showAlert(this.message, AlertType.Success);
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Unable to generate report.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
      },
    });
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  getPdf(id: string): void {
    this.bill
      .getPdf<Blob>(
        id,
        localStorage.getItem('token'),
        localStorage.getItem('role')
      )
      .subscribe({
        next: (data: Blob) => {
          const file = new Blob([data], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL);
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Unable to generate PDF.';
          this.alertService.showAlert(errorMessage, AlertType.Error);
        },
      });
  }
}
