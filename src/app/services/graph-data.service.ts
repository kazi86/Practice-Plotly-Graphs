import {Injectable} from "@angular/core";
import {environment} from "src/environment/developement";
import {HttpClient} from '@angular/common/http';
import {DateRangeModel} from "../models/date-range.model";
import {EntityObjectModel, InventoryFlowRateDataModel} from "../models/Inventory-FlowRateData.model";

@Injectable({
  providedIn: 'root',
})
export class GrahphDataService {
  public ctrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  public getInventoryAndFlowrate(req: DateRangeModel) {
    const url = `${this.ctrl}/v1/GraphData/GetInventoryAndFlowrate`;

    return this.http.post <InventoryFlowRateDataModel>(url, req);
  }

  public makeCarryForwardFlowRatesData(flowRates: EntityObjectModel[]) {

    let carryForwardedFlowRatesData: EntityObjectModel[] = [];

    for (let index = 0; index < flowRates.length; index++) {

      //Get Access to each item and set its createdOn to nextMinute
      let currentFlowRate = flowRates[index];
      currentFlowRate.createdOn = this.roundUptoNextMinute(currentFlowRate.createdOn);

      //Check if the Current Item does not already exist

      //last Updates FlowRate
      let lastUpdatedFlowRate = carryForwardedFlowRatesData[carryForwardedFlowRatesData.length - 1];

      if (carryForwardedFlowRatesData.length > 0 && new Date(lastUpdatedFlowRate.createdOn) === new Date(currentFlowRate.createdOn)) {
        // If item for same minute exist replace it with currentItem
        currentFlowRate.createdOn = new Date(currentFlowRate.createdOn);
        carryForwardedFlowRatesData[carryForwardedFlowRatesData.length - 1] = currentFlowRate
      }
      else{
        //Just push the current Item in the returned array
        currentFlowRate.createdOn = new Date(currentFlowRate.createdOn);
        carryForwardedFlowRatesData.push(currentFlowRate);

      }

      //Check for missing minutes
      if(index + 1 < flowRates.length){
        //Next FlowRate Item
        let nextFlowRate = flowRates[index + 1];
        nextFlowRate.createdOn = this.roundUptoNextMinute(nextFlowRate.createdOn);

        //Missing Time
        let missingTime = new Date(currentFlowRate.createdOn);
        missingTime.setMinutes(missingTime.getMinutes() + 1);

        while(missingTime.getTime() < new Date(nextFlowRate.createdOn).getTime()){

          let data = {...currentFlowRate};
          data.createdOn = new Date(missingTime);

          carryForwardedFlowRatesData.push(data);

          missingTime.setMinutes(missingTime.getMinutes() + 1);

        }
      }
    }

    return carryForwardedFlowRatesData;

  }

  public makeCarryForwardInventoryData(flowRates:EntityObjectModel[] , inventories:EntityObjectModel[]){

    let carryForwardedInventoryData = [];

    let inventoryIndex = 0;
    let flowRateIndex = 0;

    while(inventoryIndex < inventories.length && flowRateIndex < flowRates.length){
      let currentInventory = inventories[inventoryIndex];
      let currentFlowRate = flowRates[flowRateIndex];

      let currentInventoryTime = new Date(currentInventory.createdOn);
      let currentFlowRateTime = new Date(currentFlowRate.createdOn);

      let currentInventoryRoundedTime = this.roundUptoNextMinute(currentInventory.createdOn);

      if(currentFlowRateTime.getTime() === currentInventoryRoundedTime.getTime()){
        //Calculate the Inventory Normally and push the item in the Array
        let inventory = {...currentInventory};
        inventory.value = inventory.value - currentFlowRate.value * this.getTimeDifferenceInHours(currentInventory.createdOn ,currentFlowRate.createdOn);
        inventory.createdOn = new Date(currentInventoryRoundedTime);
        carryForwardedInventoryData.push(inventory);
        inventoryIndex ++;
        flowRateIndex ++;
      }
      else if(currentInventoryRoundedTime.getTime() < currentFlowRateTime.getTime()){
        //Inventory Time is behind flowRate Time
        let inventory = {...currentInventory};
        inventory.value = inventory.value - (currentFlowRate.value * this.getTimeDifferenceInHours(currentInventoryTime,currentFlowRateTime));
        inventory.createdOn = new Date(currentFlowRate.createdOn);
        carryForwardedInventoryData.push(inventory);
        inventoryIndex ++;
      }
      else{
        //Inventory Time is ahead of flowRate Time
        let lastUpdatedInventory = carryForwardedInventoryData.length > 0 ?
          carryForwardedInventoryData[carryForwardedInventoryData.length - 1] :
          inventories[inventoryIndex > 0 ? inventoryIndex[inventoryIndex - 1 ] : 0];

        let inventory = {...lastUpdatedInventory};
        inventory.value = inventory.value - currentFlowRate.value * Math.max(this.getTimeDifferenceInHours(inventory.createdOn,currentFlowRate.createdOn) , 0);
        inventory.createdOn = new Date(currentFlowRate.createdOn);
        carryForwardedInventoryData.push(inventory);
        flowRateIndex ++;

      }

    }

    let data = carryForwardedInventoryData;

    return carryForwardedInventoryData;

  }

  public roundUptoNextMinute(date: Date) {
    let newDate = new Date(date);
    let currentDate = new Date(date);

    if (newDate.getSeconds() <= 59 && newDate.getSeconds() != 0) {
      newDate.setMinutes(newDate.getMinutes() + 1);
    }

    //if the item time exceeds currentTime then return CurrentTime
    if (newDate.getTime() > new Date().getTime()) {
      return currentDate;
    }

    newDate.setSeconds(0, 0);

    return newDate;

  }

  public getTimeDifferenceInHours(startDate: Date, endDate: Date) {

    let fromDate = new Date(startDate);

    let toDate = new Date(endDate);

    let timeDifferenceInMs = toDate.getTime() - fromDate.getTime();

    return timeDifferenceInMs / (1000 * 60 * 60);

  }
}
