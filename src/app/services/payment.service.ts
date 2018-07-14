import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/shareReplay';

const CSRF_COOKIE:string = "csrftoken";

@Injectable()
export class PaymentService {

  headers:HttpHeaders;
  csrf_tok:string = null;

  constructor(private http:HttpClient) { 
    let ca:Array<String> = document.cookie.split(';');
    for (let i:number = 0; i < ca.length; i += 1){
      if (ca[i].indexOf(CSRF_COOKIE) == 0){
        this.csrf_tok = ca[i].substring(CSRF_COOKIE.length + 1);
      }
    }

    // Set token header (if not found, user service will redirect to login)
    if (this.csrf_tok){
      this.headers = new HttpHeaders({"content-type": "application/json", "X-CSRFToken": this.csrf_tok});
    }
  }

  /* Wrappers for processPayment, specifying which plan */
  processMonthlyPayment(token:string){
    return this.processPayment("/api/stripe/customer/subscribe/monthly/", token);
  }

  processAnnualPayment(token:string){
    return this.processPayment("/api/stripe/customer/subscribe/annual/", token);
  }

  /* Sends payment information and subscribes a user to a payment plan */
  processPayment(url:string, token:string){
    let request = this.http.post(
      url,
      {"stripeToken": token},
      {headers: this.headers}
    ).shareReplay();

    request.subscribe(
      (results) => {},
      (err:HttpErrorResponse) => {
        console.error(err.error);
      }
    );
    return request;
  }

  /* Retrieves customer subscription status, for use with e.g. notifications */
  getStatus(){
    let request = this.http.get(
      '/api/stripe/customer/status/',
      {headers: this.headers}
    ).shareReplay();
    request.subscribe(
      () => {},
      (err: HttpErrorResponse) => {
        console.error(err.message);
      }
    );
    return request;
  }

}
