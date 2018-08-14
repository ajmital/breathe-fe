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

  /* Wrappers for processPayment, specifying which plan */
  processMonthlyPayment(token:string ,coupon:string){
    return this.processPayment("/api/stripe/customer/subscribe/monthly/", token, coupon);
  }

  processAnnualPayment(token:string, coupon:string){
    return this.processPayment("/api/stripe/customer/subscribe/annual/", token, coupon);
  }

  /*
  * Sends payment information and subscribes a user to a payment plan
  * Returns a subscription object (https://stripe.com/docs/api#subscription_object)
  */
  processPayment(url:string, token:string, coupon:string){
    let payload = {};
    if (token && token !== ""){
      payload["stripeToken"] = token;
    }
    if (coupon && coupon !== ""){
      payload["coupon"] = coupon;
    }

    let request = this.http.post(
      url,
      payload,
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


  /*
  * Because of the (necessary evil of) synchronicity of the Stripe API, this should be done only when
  * the user requests to see their payment details, and the results should be stored in memory.
  * Returns a stripe customer object (https://stripe.com/docs/api#customer_object)
  */

  getCustomer(){
    let request = this.http.get(
      '/api/stripe/customer/retrieve/',
      {headers: this.headers}
    ).shareReplay();
    
    request.subscribe(
      (results) => {
        if (results['error']){
          console.error("Customer retrieval failed: " + results['error']);
        }
      },
      (err:HttpErrorResponse) => {
        console.error(err.message);
      }
    );
    return request;
  }

  /*
  * Modifies a customer's default payment method using a stripe token 
  * Returns a stripe customer object (https://stripe.com/docs/api#customer_object)
  */
  modifyCustomer(token:string){
    let request = this.http.post(
      '/api/stripe/customer/modify/',
      {"stripeToken": token},
      {headers: this.headers}
    ).shareReplay();

    request.subscribe(
      (results) => {
        if (results['error']){
          console.error("Payment method update failed: " + results['error']);
        }
      },
      (err:HttpErrorResponse) => {
        console.error(err.message);
      }
    );

    return request;
  }

  /* Removes payment information from the user */
  deletePaymentInfo(){
    let request = this.http.delete(
      '/api/stripe/customer/delete/',
      {headers: this.headers}
    ).shareReplay();

    request.subscribe(
      (results) => {
        if (results['error']){
          console.error("Failed to delete payment info: " + results['error']);
        }
      },
      (err:HttpErrorResponse) => {
        console.error(err.message);
      }
    );

    return request;
  }


  /*
  * Changes subscription plan
  * 'subscription' should be either 'monthly' or 'annual'
  * Returns a subscription object (https://stripe.com/docs/api#subscription_object)
  */

  changeSubscription(subscription:string){
    let request = this.http.post(
      '/api/stripe/customer/subscription/modify/',
      {'subscription': subscription},
      {headers: this.headers}
    ).shareReplay();

    request.subscribe(
      (results) => {
        if (results['error']){
          console.error("Failed to modify subscription: " + results['error']);
        }
      },
      (err:HttpErrorResponse) =>{
        console.error(err.message);
      }
    )

    return request;
  }

  /* Deletes subscription associated with user */

  cancelSubscription(){
    let request = this.http.delete("/api/stripe/customer/subscription/delete/", {headers: this.headers}).shareReplay();

    request.subscribe(
      (results) => {
      },
      (err:HttpErrorResponse) => {
        console.error(err.error);
      }
    );

    return request;
  }

}


/* https://stripe.com/docs/api#subscription_object */
export class StripeSubscription{
  public id:string;
  public period_start:Date;
  public period_end:Date; // UTC
  public plan:string;
  constructor(id:string = "", period_start:number = 0, period_end:number = 0, plan_id:string = ""){
    this.id = id;
    this.period_start = (period_start == 0) ? null : new Date(period_start * 1000);
    this.period_end = (period_end == 0) ? null : new Date(period_end * 1000);
    if (plan_id == "plan_DDvxdRbzhmimuW"){
      this.plan = "annual";
    }else if (plan_id == "plan_DDvwiRtFyuFZNu"){
      this.plan = "monthly";
    }else{
      this.plan = "unknown";
    }
  };
}

export class StripeCard{
  public brand:string; // Visa, AMEX, etc.
  public last4:string;
  public expires:string = "";
  constructor(brand:string = "", last4:string = "", expires_month:string = "", expires_year:string =""){
    this.brand = brand;
    this.last4 = last4;
    if (expires_month && expires_year){
      this.expires = expires_month + '/' + expires_year;
    }
  };
}
