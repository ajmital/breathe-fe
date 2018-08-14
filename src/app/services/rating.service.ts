import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/shareReplay';

const CSRF_COOKIE:string = "csrftoken";

@Injectable()
export class RatingService {

  headers:HttpHeaders;
  csrf_tok:string = null;

  constructor(private http:HttpClient) { 
    let ca:Array<String> = document.cookie.split(';');
    for (let i:number = 0; i < ca.length; i += 1){
      let cookie = ca[i].trim();
      if (cookie.indexOf(CSRF_COOKIE) == 0){
        this.csrf_tok = cookie.substring(CSRF_COOKIE.length + 1);
      }
    }

    // Set token header (if not found, user service will redirect to login)
    if (this.csrf_tok != null){
      this.headers = new HttpHeaders({"content-type": "application/json", "X-CSRFToken": this.csrf_tok});
    }
  }

  rate(rating:number, feedback:string){
    let request = this.http.post(
      "/api/webfeedback/",
      {rating: rating, feedback: feedback},
      {headers: this.headers}).shareReplay();
    request.subscribe(
      (results) => {},
      (err:HttpErrorResponse) => {
        console.error(err.error);
      }
    );
    return request;
  }

}
