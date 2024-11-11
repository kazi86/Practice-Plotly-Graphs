import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EntityReportModel } from "../models/entity-report.mode";
import {environment} from "../../environment/developement";

@Injectable({
  providedIn : 'root'
})

export class FlowrateService {

  public ctrl : string = `${environment.apiUrl}/v1`;

  constructor(private http:HttpClient){}

  public getFlowrateReport(req:EntityReportModel){

    return this.http.post(`${this.ctrl}/ActualFlowRate/report`,req);

  }

}
