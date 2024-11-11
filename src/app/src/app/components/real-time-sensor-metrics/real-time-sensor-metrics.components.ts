import {Component, ElementRef, ViewChild} from "@angular/core";
import {FlatPickrOutputOptions} from "angularx-flatpickr/lib/flatpickr.directive";
import {PlotlyDataLayoutConfig} from "plotly.js-dist-min";
import {EntityObjectModel} from "../../../../models/Inventory-FlowRateData.model";
import {GrahphDataService} from "../../../../services/graph-data.service";
import {InventoryService} from "../../../../services/inventory.service";
import {FlowrateService} from "../../../../services/flowrate.service";
import {EntityModel} from "../../../../models/graph-data.model";

@Component({
  selector: 'real-time-sensor-metrics',
  templateUrl: './real-time-sensor-metrics.component.html',
  styleUrls: ['./real-time-sensor-metrics.component.css'],
})
export class RealTimeSensorMetricsComponent {
  public inventorySeriesXAxis: Date[] = [];

  public inventorySeriesYAxis: number[] = [];

  public flowRateSeriesXAxis: Date[] = [];

  public flowRateSeriesYAxis: number[] = [];

  public inventories: EntityObjectModel[] = [];

  public flowRates: EntityObjectModel[] = [];

  public selectedDates!: { from: Date; to: Date };

  public plotlyOptions: PlotlyDataLayoutConfig = {
    data: [],
    layout: {},
    config: {},
  };

  public dataAvailable: boolean = false;

  public applicationId: string = '49a9c4d8-c449-4e14-9cd7-5594a169257f'; //Hexanite 16A (Petro Chem - Ever Green Ref)

  @ViewChild('flatpickrInput') flatpickrInput!: ElementRef;

  constructor(
    private graphDataSvc: GrahphDataService,
    private InventortSvc: InventoryService,
    private FlowrateSvc: FlowrateService
  ) {
  }

  public ngOnInit(): void {
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    this.selectedDates = {from: today, to: todayEnd};

    this.getInventoryAndFlowrateData();
  }

  public onCalendarOpen() {
    let elementRef = this.flatpickrInput.nativeElement._flatpickr;

    if (elementRef) {
      elementRef.open();
    }
  }

  public onDateRangePick(event: FlatPickrOutputOptions) {
    if (event.selectedDates.length === 2) {
      this.dataAvailable = false;

      this.selectedDates.from = new Date(event.selectedDates[0]);
      this.selectedDates.from.setHours(0, 0, 0, 0);

      this.selectedDates.to = new Date(event.selectedDates[1]);
      this.selectedDates.to.setHours(23, 59, 59, 999);

      this.getInventoryAndFlowrateData();
    }
  }

  public getInventoryAndFlowrateData() {
    this.flowRateSeriesXAxis = [];

    this.flowRateSeriesYAxis = [];

    this.inventorySeriesXAxis = [];

    this.inventorySeriesYAxis = [];

    let req = <EntityModel>{
      applicationId: this.applicationId,
      fromDate: this.selectedDates.from,
      toDate: this.selectedDates.to,
    };

    this.graphDataSvc.getInventoryAndFlowrate(req).subscribe((data) => {

      // FlowRate at the start of the day
      let initialFlowRate = data.lastActualFlowrate;
      initialFlowRate.createdOn = new Date(this.selectedDates.from);

      //Merge it with rest of the FlowRates
      this.flowRates = [initialFlowRate].concat(data.actualFlowrate);

      //Cloning the last flowRate
      let lastFlowRate = {...this.flowRates[this.flowRates.length - 1]};

      //Check if the lastFR belongs to currentDate
      if(new Date(lastFlowRate.createdOn).getDate() !== new Date().getDate()){

        //Multiple Dates Selected Set LastFR to Day End
        lastFlowRate.createdOn = new Date(this.selectedDates.to);
        lastFlowRate.createdOn.setMinutes(lastFlowRate.createdOn.getMinutes() - 1 ); //End At 59 min

      }
      else{
        // Set the LastFR created On to currentTime
        lastFlowRate.createdOn= new Date()

      }

      //Update the FlowRates Array
      this.flowRates.push(lastFlowRate);

      //Creating the CarryForward FlowRates
      const carryForwardFlowRates = this.graphDataSvc.makeCarryForwardFlowRatesData(this.flowRates);

      //Calculate Initial Inventory
      let initialInventory = data.lastInventory;
      initialInventory.value = initialInventory.value - (initialFlowRate.value * this.graphDataSvc.getTimeDifferenceInHours(initialInventory.createdOn,initialFlowRate.createdOn));
      initialInventory.createdOn = new Date(this.selectedDates.from);


      this.inventories = [initialInventory].concat(data.inventory);

      this.inventories = this.inventories.map(item=>{
        return({...item,
       createdOn : new Date(item.createdOn)})
      });

      //Adjust the Last Inventory Point
      let lastInventory = {...this.inventories[this.inventories.length - 1 ]};

      if(this.selectedDates.to.getDate() !== new Date().getDate()){
        lastInventory.createdOn = new Date(this.selectedDates.to);
        lastInventory.createdOn.setMinutes(lastInventory.createdOn.getMinutes() - 1); //End at 59 Minutes

      }else{
        lastInventory.createdOn = new Date()
      }

      lastInventory.value = lastInventory.value - lastFlowRate.value * this.graphDataSvc.getTimeDifferenceInHours(lastInventory.createdOn , lastFlowRate.createdOn);

      this.inventories.push(lastInventory);

      let carryForwardedInventory = this.graphDataSvc.makeCarryForwardInventoryData(carryForwardFlowRates,this.inventories);


      carryForwardedInventory.forEach(item=>{

        this.inventorySeriesXAxis.push(item.createdOn);
        this.inventorySeriesYAxis.push(item.value);

      });

      carryForwardFlowRates.forEach(item=>{

        this.flowRateSeriesXAxis.push(item.createdOn);
        this.flowRateSeriesYAxis.push(item.value);

      });

      this.initGraph();

    });
  }

  public initGraph() {
    this.plotlyOptions.data = [
      {
        name:'Inventory (gal)',
        title: {
          text: 'Inventory',
        },
        type: 'scatter',
        x: this.inventorySeriesXAxis,
        y: this.inventorySeriesYAxis,
      },
      {
        name:'Flowrate (gph)',
        title: {
          text: 'Flowrate',
        },
        type: 'scatter',
        x: this.flowRateSeriesXAxis,
        y: this.flowRateSeriesYAxis,
      },
    ];

    this.plotlyOptions.layout = {
      yaxis: {
        title: 'Inventory',
      },
      yaxis2: {
        title: 'Flowrate',
      },
      hovermode: 'x unified',
    };

    this.plotlyOptions.config = {
      responsive: true,
    };

    this.dataAvailable = true;
  }
}
