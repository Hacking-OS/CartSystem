import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { SharedService } from "../../sharedModule/sharedServices/shared.service";

export class LoginEndPointService {
  constructor(private http: HttpClient,private router: Router, private sharedService:SharedService) { }
}
