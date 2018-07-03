import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';

const now:Date = new Date();

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  // Switch to control loading animation
  isLoaded:boolean = false;

  // Control showing initial setup page
  firstTimeSetup:boolean = false;
  modalRef:NgbModalRef = null;
  @ViewChild('setupModal')
  modalTemplate:TemplateRef<any>;


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

  // Switches to control which component is displayed
  dashboard:boolean = true;
  food:boolean = false;
  settings:boolean = false;

  constructor(public userService:UserService, private modalService:NgbModal) { }

  ngOnInit() {
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

  show(component:string){
    this.dashboard = false;
    this.food = false;
    this.settings = false;

    switch(component){
      case "dashboard": {
        this.dashboard = true;
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
