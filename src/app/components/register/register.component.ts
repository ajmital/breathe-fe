import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const api_url:string = "http://localhost:8000/";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {

  headers:HttpHeaders = new HttpHeaders({
    "Content-Type": "application/json"
  });

  // Indicates error to user
  show_pass_check_err:boolean = false;
  show_pass_len_err:boolean = false;
  show_email_err:boolean = false;
  show_exists_err:boolean = false;
  username:string;

  constructor(private http:HttpClient, private router:Router) { }

  ngOnInit() {

  }

  register(username:string, password:string, password_check:string){
    this.username = username;
    this.show_email_err = false;
    this.show_pass_check_err = false;
    this.show_pass_len_err = false;
    // Form validation
    if (password.length < 8){
      this.show_pass_len_err = true;
    }

    if(password != password_check){
      this.show_pass_check_err = true;
    }
    // Simple regex for email
    if (username.search("^.+@.+\..+$") == -1){
      this.show_email_err = true;
    }

    if (this.show_email_err || this.show_pass_check_err || this.show_pass_len_err){
      return;
    }
    this.http.post(
      api_url + "rest-auth/registration/",
      {"username": username, "password1":password, "password2":password_check}
    ).subscribe(
      results => {
        sessionStorage.setItem("user", results["key"]);
        // Email is not automatically set, propogate forward to post-register
        sessionStorage.setItem("email", username);
        this.router.navigateByUrl("/post-register");
      },
      err => {
        // User already exists
        if (err["error"]["username"]){
          this.show_exists_err = true;
        }
        console.log(err["error"]);
      }
    );
  }

}
