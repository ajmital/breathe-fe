import { Component, OnInit } from '@angular/core';
import {NgxChartsModule} from '@swimlane/ngx-charts'; // Keep this even if "unused"
import { UserService } from '../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';

const NOW:Date = new Date();


@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {
  
  // Chart Variables/Methods
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Date';
  showYAxisLabel = true;
  yAxisLabel = 'Weight';
  weights = []; // Stores entire weight dataset including date values for range queries

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  autoScale = true;

  data = [
    {
      "name":"Weight",
      "series": []
    }
  ];

  // Chart method
  onSelect(event) {
    console.log(event);
  }

  // Display loading gif if weights are not loaded yet
  weightsLoaded:boolean = false;

  // Range selection
  minDate:NgbDateStruct = {year: 2017, month:1, day:1};
  maxDate:NgbDateStruct = {year: NOW.getFullYear(), month: NOW.getMonth() + 1, day: NOW.getDate()};

  endDate:NgbDateStruct = this.maxDate;

  wkDate:NgbDateStruct;
  monthDate:NgbDateStruct;
  yearDate:NgbDateStruct;
  startDate:NgbDateStruct;

  constructor(private userService:UserService) { }

  ngOnInit() {
    // Set wkDate, monthDate, yearDate
    let date:Date = new Date();
    date.setFullYear(NOW.getFullYear() - 1);
    this.yearDate = {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
    date = new Date();
    date.setDate(NOW.getDate() - 7);
    this.wkDate = {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
    date = new Date();
    date.setMonth(NOW.getMonth() - 1);
    this.monthDate = {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};

    // Set initial start date to a month ago
    this.startDate = this.monthDate;

    this.userService.getWeights().subscribe(
      (response:Weight[]) => {
        response = response.reverse(); // Simpler to order this way
        this.weightsLoaded = true;
        this.weightsToData(response);
        this.update();
      },
      (err:HttpErrorResponse) =>{
        console.error(err);
      }
    );
  }

  setWeek(){
    this.startDate = this.wkDate;
    this.update();
  }

  setMonth(){
    this.startDate = this.monthDate;
    this.update();
  }

  setYear(){
    this.startDate = this.yearDate;
    this.update();
  }

  update(){

    this.data[0].series = [];

    if (this.dateStructToDate(this.startDate, false) > this.dateStructToDate(this.endDate, true)){
      this.startDate = this.endDate;
    }

    for (let i = 0; i < this.weights.length; i += 1){
      let date:Date = this.weights[i]["date"];
      if (date >= this.dateStructToDate(this.startDate, false) && date <= this.dateStructToDate(this.endDate, true)){
        this.data[0].series.push(
          {
            "name": (date.getMonth() + 1).toString() + '/' + date.getDate() + '/' + date.getFullYear().toString().substring(2),
            "value": this.weights[i]["value"]
          }
        );
     }
    }
    this.data = [...this.data]; // Force chart redraw
  }

  // Parse response and convert timestamps to Date objects
  weightsToData(response:Weight[]){

    for (let i = 0; i < response.length; i = i + 1){
      this.weights.push(
        {
          "date": new Date(response[i].timestamp),
          "value": response[i].value
        }
      );
    }
  }

  // Utility functions
  dateStructToDate(dateStruct:NgbDateStruct, endofday:boolean){
    let date = new Date();
    date.setFullYear(dateStruct.year, dateStruct.month - 1, dateStruct.day);
    if (endofday){
      date.setHours(11, 59, 59, 999);
    }else{
      date.setHours(0, 0, 0, 0);
    }
    return date;
  }

  timestampToDateString(timestamp:string){
    let index:number = timestamp.indexOf('T');
    if (index != -1){
      timestamp = timestamp.substring(0, index);
    }

    let vals = timestamp.split('-');
  
    // Remove 0 padding
    for (let i = 0; i < vals.length; i = i + 1){
      if (vals[i].startsWith('0')){
        vals[i] = vals[i].substring(1);
      }
    }

    // Shorten year
    if (vals[0].length == 4){
      vals[0] = vals[0].substring(2);
    }

    return vals[1] + '/' + vals[2] + '/' + vals[0];

  }
}

interface Weight{
  id:string;
  email:string;
  value:number;
  timestamp:string;  
}
