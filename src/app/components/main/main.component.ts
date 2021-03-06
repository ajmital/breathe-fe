import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';

import { UserService } from '../../services/user.service';
import {PaymentService} from '../../services/payment.service';
import {RatingService} from '../../services/rating.service';

import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

import { HttpErrorResponse } from '@angular/common/http';

import { DashboardComponent } from '../dashboard/dashboard.component';
import { FoodComponent } from '../food/food.component';
import { SettingsComponent } from '../settings/settings.component';

import { isNullOrUndefined } from 'util';
import { TreeMapModule } from '../../../../node_modules/@swimlane/ngx-charts';

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
  isLoaded:boolean = false;
  statusReady:boolean = false;

  // Control showing initial setup page
  firstTimeSetup:boolean = false;
  @ViewChild('setupModal')
  setupModal:TemplateRef<any>;

  @ViewChild('subscribeModal')
  subscribeModal:TemplateRef<any>;

  @ViewChild('subscribeFirstModal')
  subscribeFirstModal:TemplateRef<any>;

  @ViewChild('errorModal')
  errorModal:TemplateRef<any>;
  errorModalBody:string = "";

  @ViewChild('installModal')
  installModal:TemplateRef<any>;

  @ViewChild('ratingModal')
  ratingModal:TemplateRef<any>;
  ratingError:boolean = false;

  activeModal:NgbModalRef = null;

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

  // Rating models
  rating:string = null; // String representation of int
  feedback:string = null;

  // Side nav control
  navOpen:boolean = false;

  // Switches to control which component is displayed
  dashboard:boolean = true;
  food:boolean = false;
  settings:boolean = false;


  currentYear:number;
  constructor(
    public userService:UserService,
    private modalService:NgbModal,
    public paymentService:PaymentService,
    private ratingService:RatingService
  ) {}

  ngOnInit() {
    this.currentYear = now.getFullYear();
    let nowString:string = now.getFullYear().toString() + '-' + (now.getMonth() + 1).toString() + '-' + now.getDate().toString();
    this.userService.getUser().subscribe(
      (user_data:any) => {
        if (user_data["weight"] == 0 || isNullOrUndefined(user_data["feet"]) || !user_data["birth_month"] || !user_data["birth_year"] || 
        user_data["feet"] == 0 || isNullOrUndefined(user_data["inches"]) || !user_data["weight"]){
          this.month = user_data["birth_month"];
          this.year = user_data["birth_year"];
          this.feet = user_data["feet"];
          this.inches = user_data["inches"];
          this.weight = user_data["weight"];
          this.fullName = user_data["full_name"];
          this.firstTimeSetup = true;
          this.activeModal = this.modalService.open(this.setupModal, {size: 'lg', keyboard: false});
        }
      },
      (err:HttpErrorResponse) => {
        this.isLoaded = true;
        this.errorModalBody = "Failed to load user: " + err.error;
        this.activeModal = this.modalService.open(this.errorModal);
      },
      () => {
        this.isLoaded = true;
      }
    );
    this.userService.getResults(nowString).subscribe(
      (response:any) => {
        this.training_status = response["training"];
        switch(this.training_status){
          case "beginner":{
            this.training_width = 20; // For later usage with sidenav display of progress
            break;
          }
        }
      },
      (err:HttpErrorResponse) => {
        console.error(err);
      }
    );

    this.paymentService.getStatus().subscribe(
      (results) => {
        this.userService.subscriptionStatus = results['status'];
      },
      (err) => {
        this.statusReady = true; // Should be caught by onComplete, but isn't
      },
      () => {
        this.statusReady = true;
      }
    );

  }

  setUser(){
    this.birthError = false;
    this.heightError = false;
    this.weightError = false;
    // Input validation
    if (isNullOrUndefined(this.month) || this.month < 1 || this.month > 12 || !Number.isInteger(this.month) ||
      isNullOrUndefined(this.year) || this.year > now.getFullYear() || this.year < 1900 ||
      !Number.isInteger(this.year)
    ){
      this.birthError = true;
    }

    if (isNullOrUndefined(this.inches)){
      this.inches = 0;
    }

    if (isNullOrUndefined(this.feet) || this.feet < 0 || !Number.isInteger(this.feet) ||
      this.inches < 0 || this.inches > 11 || !Number.isInteger(this.inches)
    ){
      this.heightError = true;
    }

    if (!this.weight || this.weight < 0){ // Weight cannot be 0
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
      (results) => {
        this.firstTimeSetup = false;
        this.dismissActiveModal();
        this.activeModal = this.modalService.open(this.subscribeFirstModal);
      },
      (err:HttpErrorResponse) => {
        this.dismissActiveModal();
        this.errorModalBody = "There was an error updating your user information: " + err.error;
        this.activeModal = this.modalService.open(this.errorModal);
        console.error(err);
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

  /* Is user subscribed */
  isSubscribed(){
    return this.userService.subscriptionStatus === 'active' || this.userService.subscriptionStatus === 'past_due' || this.userService.subscriptionStatus === 'trialing';
  }
  
  installApp(){
    this.closeNav();
    this.dismissActiveModal();
    if (this.isSubscribed()){
      this.activeModal = this.modalService.open(this.installModal);
    }else{
      this.openSubscribeModal();
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

  openRatingModal(){
    this.dismissActiveModal();
    this.closeNav();
    this.activeModal = this.modalService.open(this.ratingModal);
  }

  rate(){
    if (isNullOrUndefined(this.rating)){
      this.ratingError = true;
    }else{
      this.ratingError = false;
      let rating:number = parseInt(this.rating);
      let feedback:string;
      if (isNullOrUndefined(this.feedback)){
        feedback = "";
      }else{
        feedback = this.feedback;
      }
      this.ratingService.rate(rating, this.feedback);
      this.dismissActiveModal();
    }
  }

  dismissActiveModal(){
    if (this.activeModal){
      this.activeModal.close();
      this.activeModal = null;
    }
  }

  logout(){
    this.userService.logout();
  }

  openTab(url:string){
    window.open(url);
  }

  /* Controls side nav */
  openNav(){
    this.navOpen = true;
  }

  closeNav(){
    this.navOpen = false;
  }

  openSubscribeModal(){
    this.dismissActiveModal();
    this.activeModal = this.modalService.open(this.subscribeModal);
  }

  dismissAndSwitch(component:string){
    this.dismissActiveModal();
    this.show(component);
  }

}
