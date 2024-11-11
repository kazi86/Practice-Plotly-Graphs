import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { RealTimeSensorMetricsModule } from './src/app/components/real-time-sensor-metrics/real-time-sensor-metrics.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RealTimeSensorMetricsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
