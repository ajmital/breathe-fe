import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';

const api_url:string = "http://localhost:8000/";

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})

export class LandingPageComponent implements OnInit {

  persist_credentials:boolean = false;
  options:RequestOptions = new RequestOptions(
    {
      headers: new Headers({
        "Content-Type": "application/json"
      })
    }
  );

  constructor(private http:Http, private router:Router) { }

  ngOnInit() {
    // Check if user is already logged in
    let user = localStorage.getItem('user');
    if (user != null){
      this.router.navigateByUrl('/main');
    }else{
      user = sessionStorage.getItem('user');
      if (user != null){
        this.router.navigateByUrl('/main');
      }
    }

  }

  login(email:string, password:string){
    this.http.post(
      api_url + "rest-auth/login/",
      {"email":email, "password":password, "username":email},
      this.options
    ).subscribe(
      results => {
        let user_key:string = results.json()["key"];
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
        console.log(err);
      }
    );
  }
}