import { Component, OnInit, HostListener } from '@angular/core';
import { UserService } from '../../services/user.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {PaymentService} from '../../services/payment.service';
import {User} from '../../services/user.service';
import { TreeMapModule } from '../../../../node_modules/@swimlane/ngx-charts';

const now = new Date();
const MONTHLY_RATE:number = 1495;
const ANNUAL_RATE:number = 9995;


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  /* Generic loading indicator (most useful for payment-related requests, due to synchronous requests made on the server side) */
  isLoading:boolean = false;
  loadingText:string = ""; // Used to provide message while loading

  showSuccess:boolean = false; // Shows success message on saving user
  birthError:boolean = false; // Controls alert for birth month/year input validation
  heightError:boolean = false;
  weightError:boolean = false;
  
  /* Payment-related switches */
  paymentProcessed:boolean = false; // Controls dialogue screen after payment interaction
  paymentError:boolean = false; // Indicates that some point in the payment interaction failed
  paymentResponseText:string = "";
  subscriptionError:boolean = false; // User has no subscription

  hrSync:string = null;
  syncAttempt:string = null;

  stripeHandler:any; // Form for verifying stripe information

  /* Temporary user object for modifying */
  tempUser:User = new User();

  constructor(private userService:UserService, private paymentService:PaymentService) { }

  ngOnInit() {} // Allow parent component to call update() method

  /* Configure stripe handler for creating customers */
  configureStripe(email:string){
    this.stripeHandler = StripeCheckout.configure({
      name: 'Breathe',
      key: "pk_test_zeaM0ynDnovC8wopeewHcOz3",
      image: 'assets/img/breathe-logo.svg',
      locale: 'auto',
      allowRememberMe: false,
      zipCode: true, // Additional verification step
      panelLabel: 'Subscribe', // Button text in stripe handler
      email: email,
    });  
  }

  /* Save tempUser as actual user */
  save(){
    this.loadingText = "Saving user...";
    this.isLoading = true;
    this.birthError = false;
    this.heightError = false;
    this.weightError = false;
    // Input validation
    if (!this.tempUser.birth_month ||
      this.tempUser.birth_month < 1 || this.tempUser.birth_month > 12 ||
      !Number.isInteger(this.tempUser.birth_month) ||
      !this.tempUser.birth_year ||
      this.tempUser.birth_year > now.getFullYear() || this.tempUser.birth_year < 1900 ||
      !Number.isInteger(this.tempUser.birth_year)
    ){
      this.birthError = true;
    }

    if (!this.tempUser.inches){
      this.tempUser.inches = 0;
    }

    if (!this.tempUser.feet ||
      this.tempUser.feet < 0 ||
      !Number.isInteger(this.tempUser.feet) ||
      !this.tempUser.inches ||
      this.tempUser.inches < 0 || this.tempUser.inches > 11 ||
      !Number.isInteger(this.tempUser.inches)
    ){
      this.heightError = true;
    }

    if (!this.tempUser.weight || this.tempUser.weight < 0){
      this.weightError = true;
    }

    if (this.birthError || this.heightError || this.weightError){
      this.isLoading = false;
      return;
    }

    this.userService.user = this.tempUser;
    this.userService.setUser().subscribe(
      (results) => {
        this.showSuccess = true;
        setTimeout(() => this.showSuccess = false, 5000);
      },
      (err:HttpErrorResponse) => {
        console.error(err);
      },
      () => {
        this.isLoading = false;
      }
    )
  }

  /* Replace tempUser with actual one */
  cancel(){
    this.birthError = false;
    this.heightError = false;
    this.weightError = false;
    this.update(null);
  }

  /* Get up-to-date user info */
  /* If argument is supplied (from parent component) use that to initialize user */
  update(user:User){
    if (user){
      this.tempUser = user;
      this.hrSync = this.timestampToDateString(this.tempUser.last_hr_sync);
      this.syncAttempt = this.timestampToDateString(this.tempUser.last_hr_sync_attempt);
      this.configureStripe(this.tempUser.email); // Only configure once
    }else{
      this.userService.getUser().subscribe(
        (results:any) => {
          this.tempUser = results;
          this.hrSync = this.timestampToDateString(this.tempUser.last_hr_sync);
          this.syncAttempt = this.timestampToDateString(this.tempUser.last_hr_sync_attempt);
        },
        (err) => {},
        () => {
          this.isLoading = false;
        }
      );
    }
  }

  /* Opens handler with configuration/callback for monthly plan */
  openStripeMonthly(){
    this.stripeHandler.open({
      description: 'Monthly subscription plan',
      amount: MONTHLY_RATE,
      token: token => {
        this.loadingText = "Subscribing user..."
        this.isLoading = true;
        this.paymentService.processMonthlyPayment(token).subscribe(
          (results) => {
            this.verifyPaymentStatus();
          },
          (err:HttpErrorResponse) => {
            console.error("COMPONENT ERR: " + err.error);
            this.paymentResponseText = "Failed to subscribe to Breathe: " + err.error;
            this.paymentProcessed = true;
            this.paymentError = true;
            this.isLoading = false;
          }
        );
      }
    });
  }

  /* Opens handler with config/callback for annual plan */
  openStripeAnnual(){
    this.stripeHandler.open({
      description: 'Annual subscription plan',
      amount: ANNUAL_RATE,
      token: token => {
        this.paymentService.processAnnualPayment(token).subscribe(
          (results) => {
            this.verifyPaymentStatus();
          },
          (err:HttpErrorResponse) => {
            this.paymentResponseText = "Failed to subscribe to Breathe: " + err;
            this.paymentProcessed = true;
            this.paymentError = true;
            this.isLoading = false;
          }
        );
      }
    });
  }

  /* Verifies that status after payment is what it should be after subscribing(probably 'active') */
  verifyPaymentStatus(){
    this.loadingText = "Verifying that subscription was successful...";
    this.paymentService.getStatus().subscribe(
      (results) => {
        if (results['status']){
          status = results['status'];
          this.userService.subscriptionStatus = status;
          if (status === 'active' ||  status === 'past_due' || status === 'trialing'){
            // DO SOMETHING HAPPY
            this.paymentResponseText = "Take a deep breath, and let's begin";
          }else{
            this.paymentResponseText = "Subscription verification failed: status was " + status + ".";
            this.paymentError = true;
          }
        }
      },
      (err) =>{},
      () => {
        this.paymentProcessed = true;
        this.isLoading = false;
      }
    );
  }

  /* Close handler on navigation */
  @HostListener('window:popstate')
  onPopstate() {
    this.stripeHandler.close()
  }


  /* Utility functions ********************/
  timestampToDateString(timestamp:string){
    if (!timestamp) return "";
    let index:number = timestamp.indexOf('T');
    let date:string;
    let time:string = '';
    if (index != -1){
      date = timestamp.substring(0, index);
      time = timestamp.substring(index  + 1);
    }else{
      date = timestamp;
    }

    let vals = date.split('-');
    if (vals.length < 3){
      return null;
    }

    // Remove 0 padding
    for (let i = 0; i < vals.length; i = i + 1){
      if (vals[i].startsWith('0')){
        vals[i] = vals[i].substring(1);
      }
    }

    // Shorten year
    if (vals[0].length == 4){
      vals[0] = vals[0].substring(2);
    }

    return vals[1] + '/' + vals[2] + '/' + vals[0] + ' ' + time;
  }

}