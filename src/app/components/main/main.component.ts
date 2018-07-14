import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { FoodComponent } from '../food/food.component';
import { SettingsComponent } from '../settings/settings.component';

const now:Date = new Date();

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  @ViewChild(DashboardComponent)
  private dashboardComponent:DashboardComponent;

  @ViewChild(FoodComponent)
  private foodComponent:FoodComponent;

  @ViewChild(SettingsComponent)
  private settingsComponent:SettingsComponent;


  // Switch to control loading animation
  isLoaded:boolean = true; // TODO

  // Control showing initial setup page
  firstTimeSetup:boolean = false;
  modalRef:NgbModalRef = null;
  @ViewChild('setupModal')
  modalTemplate:TemplateRef<any>;

  // String to display algorithm training status
  training_status:string = null;
  training_width:number = 20; // Width of progressbar (as a percentage)


  // Temporary values to modify user for first time setup
  month:number = null;
  year:number = null;
  feet:number = null;
  inches:number = null;
  weight:number = null;
  heightError:boolean = false;
  weightError:boolean = false;
  birthError:boolean = false;
  fullName:string = null;

  // Side nav control
  navOpen:boolean = false;

  // Switches to control which component is displayed
  dashboard:boolean = true;
  food:boolean = false;
  settings:boolean = false;

  constructor(public userService:UserService, private modalService:NgbModal) { }

  ngOnInit() {
    let nowString:string = now.getFullYear().toString() + '-' + (now.getMonth() + 1).toString() + '-' + now.getDate().toString();
    this.userService.getUser().subscribe(
      (user_data:any) => {
        if ( user_data["weight"] == 0 || user_data["feet"] == 0 || !user_data["birth_month"] || !user_data["birth_year"] || 
        !user_data["feet"] || !user_data["inches"] || !user_data["weight"]){
          this.month = user_data["birth_month"];
          this.year = user_data["birth_year"];
          this.feet = user_data["feet"];
          this.inches = user_data["inches"];
          this.weight = user_data["weight"];
          this.fullName = user_data["full_name"];
          this.firstTimeSetup = true;
          this.modalRef= this.modalService.open(this.modalTemplate, {size: 'lg', keyboard: false});
        }
      },
      (err) => {},
      () => {
        this.isLoaded = true;
      }
    );
    this.userService.getResults(nowString).subscribe(
      (response:any) => {
        this.training_status = response["training"];
        switch(this.training_status){
          case "beginner":{
            this.training_width = 20;
            break;
          }
        }
      },
      (err:HttpErrorResponse) => {
        console.error(err);
      }
    );

  }

  setUser(){
    this.birthError = false;
    this.heightError = false;
    this.weightError = false;
    // Input validation
    if (!this.month || this.month < 1 || this.month > 12 || !Number.isInteger(this.month) ||
      !this.year || this.year > now.getFullYear() || this.year < 1900 ||
      !Number.isInteger(this.year)
    ){
      this.birthError = true;
    }

    if (!this.inches){
      this.inches = 0;
    }

    if (!this.feet || this.feet < 0 || !Number.isInteger(this.feet) ||
      !this.inches || this.inches < 0 || this.inches > 11 || !Number.isInteger(this.inches)
    ){
      this.heightError = true;
    }

    if (!this.weight || this.weight < 0){
      this.weightError = true;
    }

    if (this.birthError || this.heightError || this.weightError){
      return;
    }

    this.userService.user.weight = this.weight;
    this.userService.user.feet = this.feet;
    this.userService.user.inches = this.inches;
    this.userService.user.full_name = this.fullName;
    this.userService.user.birth_month = this.month;
    this.userService.user.birth_year = this.year;

    this.userService.setUser().subscribe(
      (results) => {},
      (err:HttpErrorResponse) => {
        console.error(err);
      },
      () => {
        this.firstTimeSetup = false;
        if (this.modalRef){
          this.modalRef.close();
          this.modalRef = null;
        }
      }
    )
  }

  /* Chooses which page to display */
  show(component:string){
    switch(component){
      case "dashboard": {
        this.food = false;
        this.settings = false;
        if (!this.dashboard){
          this.dashboard = true;
          this.dashboardComponent.update(); // Components not actually reloaded
        }
        break;
      }
      case "food": {
        this.dashboard = false;
        this.settings = false;
        if (!this.food){
          this.food = true;
          this.foodComponent.update();
        }
        break;
      }
      case "settings": {
        this.food = false;
        this.dashboard = false;
        if (!this.settings){
          this.settings = true;
          this.settingsComponent.update(this.userService.user); // When loading settings, pass in user object to avoid unecessary requests
        }
        break;
      }

      default: {
        this.food  = false;
        this.settings = false;
        if (!this.dashboard){
          this.dashboard = true;
          this.dashboardComponent.update();
        }
      }
    }
  }


  /* Switches to a page and closes the menu */
  menuSwitch(component:string){
    this.closeNav();
    this.show(component);
  }

  /* Sets weight option, switches to dashboard, closes menu */
  addWeight(){
    this.menuSwitch('dashboard');
    this.dashboardComponent.openWeightModal();
  }

  logout(){
    this.userService.logout();
  }

  openTab(url:string){
    window.open(url, '_blank');
  }

  /* Controls side nav */
  openNav(){
    this.navOpen = true;
  }

  closeNav(){
    this.navOpen = false;
  }

}
