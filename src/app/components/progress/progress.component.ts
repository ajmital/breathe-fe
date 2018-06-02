import { Component, OnInit } from '@angular/core';
import {NgxChartsModule} from '@swimlane/ngx-charts';

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

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  autoScale = true;

  data = [
    {
      "name":"Weight",
      "series": [
        {
          "name": "6/1/18",
          "value": 208
        },
        {
          "name": "6/2/18",
          "value": 200
        }
      ]
    }
  ]

  // Chart method
  onSelect(event) {
    console.log(event);
  }



  constructor() { }

  ngOnInit() {
  
  }

}

interface Weight{
  id:string;
  email:string;
  value:number;
  timestamp:string;  
}
