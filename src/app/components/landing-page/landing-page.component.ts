import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { ViewEncapsulation } from '@angular/core';


const api_url:string = "http://localhost:8000/";

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})

export class LandingPageComponent implements OnInit {

  persist_credentials:boolean = false;
  headers:HttpHeaders = new HttpHeaders({
    "Content-Type": "application/json"
  });


  constructor(private http:HttpClient, private router:Router, config:NgbCarouselConfig) {
    config.keyboard = false;
  }

  ngOnInit() {
    // Check if user is already logged in
    let user = localStorage.getItem('user');
    if (user == null){
      user = sessionStorage.getItem('user');
    }

    if (user != null){
        this.router.navigateByUrl('/main');
    }

  }

  login(username:string, password:string){
    document.location.href = api_url + "google/oauth2";

    this.http.post(
      api_url + "rest-auth/login/",
      {"username":username, "password":password},
      {headers: this.headers}
    ).subscribe(
      results => {
        let user_key:string = results["key"];
        if (this.persist_credentials){
          localStorage.removeItem('user');
          localStorage.setItem('user', user_key);
        }else{
          sessionStorage.removeItem('user');
          sessionStorage.setItem('user', user_key);
        }
        // Navigate to new page
        this.router.navigateByUrl('/main');
      },
      // Check for errors
      err => {
        console.log(err.body);
      }
    );
  }
}