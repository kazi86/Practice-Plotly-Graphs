import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environment/developement";
import { EntityReportModel } from "../models/entity-report.mode";

@Injectable({
  providedIn:'root'
})

export class InventoryService{

  public ctrl : string = `${environment.apiUrl}/v1`;

  constructor(private http:HttpClient){}

  public getInventoryReport (req:EntityReportModel){

    return this.http.post(`${this.ctrl}/Inventory/report`,req);

  }

}
