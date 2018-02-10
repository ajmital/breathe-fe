import { Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';

class User{
  email:string;
  weight:number;
  gender:string;
  age:number;
  height:number;
  full_name:string;
  birth_year:number;
  birth_month:number;
  constructor(){}
}

const now:Date = new Date();
const api_url:string = "http://localhost:8000/";

@Component({
  selector: 'app-post-register',
  templateUrl: './post-register.component.html',
  styleUrls: ['./post-register.component.css']
})
export class PostRegisterComponent implements OnInit {
  minDate:NgbDateStruct = {year: 1900, month:1, day:1};
  maxDate:NgbDateStruct = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};

  // Date picker model
  datePicker:NgbDateStruct = null;

  headers:HttpHeaders;
  feet:number;
  inches:number;
  heightError:boolean = false;
  gender:string;
  weight:number;
  full_name:string;
  user_tok:string;
  email:string;

  constructor(private http:HttpClient, private router:Router) { }

  ngOnInit() {
    this.user_tok = sessionStorage.getItem('user');
    this.email = sessionStorage.getItem('email');
    if (this.user_tok == null){
      this.router.navigateByUrl("/welcome");
    }
    this.headers = new HttpHeaders({"content-type": "application/json", "Authorization": "Token " + this.user_tok});
  }

  setUser(){
    // Form validation
    let height:number;
    if (this.feet != null && this.inches != null){
      if (this.feet > 0 && this.inches >= 0 && this.inches < 12){
        height = this.feet * 12 + this.inches;
        this.heightError = false;
      }else{
        this.heightError = true;
      }
    }else{
      this.heightError = true;
    }

    let userObject = {
      weight: this.weight,
      gender: this.gender,
      height: height,
      full_name: this.full_name,
      birth_month: this.datePicker.month,
      email: this.email,
      birth_year: this.datePicker.year
    };

    this.http.put(
      api_url + "api/users/update/",
      userObject,
      {headers: this.headers}
    ).subscribe(
      results => {
        this.router.navigateByUrl("/main");
      },
      err => {
        console.log(err.body);
      }
    );
  }

}
