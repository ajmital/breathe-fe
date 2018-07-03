import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  // Switches to control which component is displayed
  dashboard:boolean = true;
  progress:boolean = false;
  food:boolean = false;
  settings:boolean = false;

  constructor(public userService:UserService) { }

  ngOnInit() {
    this.userService.getUser();
  }


  show(component:string){
    this.dashboard = false;
    this.progress = false;
    this.food = false;
    this.settings = false;

    switch(component){
      case "dashboard": {
        this.dashboard = true;
        break;
      }
      case "progress": {
        this.progress = true;
        break;
      }
      case "food": {
        this.food = true;
        break;
      }
      case "settings": {
        this.settings = true;
        break;
      }

      default: {
        this.dashboard = true;
      }
    }
  }

}
