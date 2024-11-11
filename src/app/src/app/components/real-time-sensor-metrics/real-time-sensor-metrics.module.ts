import { NgModule } from "@angular/core";
import { RealTimeSensorMetricsComponent } from "./real-time-sensor-metrics.components";
import { FlatpickrModule } from "angularx-flatpickr";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PlotlyModule } from "angular-plotly.js";
import * as PlotlyJS from 'plotly.js-dist-min';

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  declarations: [RealTimeSensorMetricsComponent],
  imports: [PlotlyModule, FormsModule, FlatpickrModule.forRoot(), CommonModule],
  exports: [RealTimeSensorMetricsComponent]
})
export class RealTimeSensorMetricsModule {}
