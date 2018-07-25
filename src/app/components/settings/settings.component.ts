import { Component, OnInit, ViewChild, HostListener, TemplateRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {PaymentService, StripeCard, StripeSubscription} from '../../services/payment.service';
import {User} from '../../services/user.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { isNull, isUndefined, isNullOrUndefined } from 'util';

const now = new Date();
const MONTHLY_RATE:number = 1495;
const ANNUAL_RATE:number = 9995;


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  /* Current year, used to set maximum on birth year input dynamically */
  currentYear:number = now.getFullYear();

  /* Generic loading indicator (most useful for payment-related requests, due to synchronous requests made on the server side) */
  isLoading:boolean = false;
  loadingText:string = ""; // Used to provide message while loading
  firstLoad:boolean = true; // Marks whether this is first time page was loaded

  showSuccess:boolean = false; // Shows success message on saving user
  birthError:boolean = false; // Controls alert for birth month/year input validation
  heightError:boolean = false;
  weightError:boolean = false;

  /* Payment storage objects */
  stripeCard:StripeCard = new StripeCard();
  stripeSubscription:StripeSubscription = new StripeSubscription();
  couponCode:string = "";

  activeModal:NgbModalRef = null;
  confirmModal:NgbModalRef = null; // In case we need nested modals

  /* Payment processed modal */
  @ViewChild('paymentProcessedModal')
  paymentProcessedModal:TemplateRef<any>;
  paymentProcessedModalTitle:string = "";
  paymentProcessedModalBody:string = "";
  paymentProcessedModalButton:string = "Dismiss";

  /* Delete payment modal */
  @ViewChild('paymentDeleteModal')
  paymentDeleteModal:TemplateRef<any>;

  /* Modify subscription modal */
  @ViewChild('changeSubscriptionModal')
  changeSubscriptionModal:TemplateRef<any>;

  /* Subscription confirmation (select subscription)*/
  @ViewChild('subscribeConfirmationModal')
  subscribeConfirmationModal:TemplateRef<any>;
  changePayment:boolean = false;

  @ViewChild('cancelSubscriptionModal')
  cancelSubscriptionModal:TemplateRef<any>;

  hrSync:string = null;
  syncAttempt:string = null;

  stripeHandler:any; // Form for verifying stripe information

  /* Temporary user object for modifying */
  tempUser:User = new User();

  constructor(public userService:UserService, private paymentService:PaymentService, private modalService:NgbModal) { }

  ngOnInit() {} // Allow parent component to call update() method

  /* Is user subscribed */
  isSubscribed(){
    return this.userService.subscriptionStatus === 'active' || this.userService.subscriptionStatus === 'past_due' || this.userService.subscriptionStatus === 'trialing';
  }

  /* Configure stripe handler for creating customers */
  configureStripe(email:string){
    this.stripeHandler = StripeCheckout.configure({
      name: 'Breathe',
      key: "pk_test_zeaM0ynDnovC8wopeewHcOz3",
      image: 'assets/img/breathe-b-green.png',
      locale: 'auto',
      zipCode: true,
      allowRememberMe: false,
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

    if (isNullOrUndefined(this.tempUser.feet) ||
      this.tempUser.feet < 0 ||
      !Number.isInteger(this.tempUser.feet) ||
      isNullOrUndefined(this.tempUser.inches) ||
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
    if (this.firstLoad){
      this.firstLoad = false;
      this.getCustomer();
    }

    if (user){
      this.tempUser = user;
      this.hrSync = this.timestampToDateString(this.tempUser.last_hr_sync);
      this.syncAttempt = this.timestampToDateString(this.tempUser.last_hr_sync_attempt);
      this.configureStripe(this.tempUser.email);
    }else{
      this.userService.getUser().subscribe(
        (results:any) => {
          this.tempUser = results;
          this.hrSync = this.timestampToDateString(this.tempUser.last_hr_sync);
          this.syncAttempt = this.timestampToDateString(this.tempUser.last_hr_sync_attempt);
          this.configureStripe(this.tempUser.email);
        },
        (err) => {},
        () => {
          this.isLoading = false;
        }
      );
    }
  }

  /* Populates subscription and card objects */
  getCustomer(){
    this.paymentService.getCustomer().subscribe(
      (results) => {
        if (results["sources"]["data"].length > 0){
          let cardObject = results["sources"]["data"][0];
          this.stripeCard = new StripeCard(cardObject['brand'], cardObject['last4'], cardObject['exp_month'], cardObject['exp_year']);
        }
        if (results["subscriptions"]["data"].length > 0){
          let subObject = results["subscriptions"]["data"][0];
          this.stripeSubscription = new StripeSubscription(subObject['id'], subObject['current_period_start'], subObject['current_period_end'], subObject['plan']['id']);
        }
      }
    );
  }

  /* Opens handler with configuration/callback for monthly plan */
  openStripeMonthly(){
    this.dismissActiveModal();

    if (!this.stripeCard || !this.stripeCard.brand){
      this.changePayment = true;
    }
    if (!this.changePayment && this.stripeCard && this.stripeCard.brand){
      this.processMonthlyPayment(null, this.couponCode);
    }else{

      this.stripeHandler.open({
        description: 'Monthly subscription plan',
        amount: MONTHLY_RATE,
        panelLabel: 'Subscribe', // Button text in stripe handler
        token: token => {
          this.processMonthlyPayment(token, this.couponCode);
        }
      });
    }
  }

  processMonthlyPayment(token:string, coupon:string){
    this.loadingText = "Subscribing user..."
    this.isLoading = true;
    this.paymentService.processMonthlyPayment(token, coupon).subscribe(
      (results) => {
        if (results['error']){
          this.paymentProcessedError(results['error']);
        }else{
          this.verifyPaymentStatus();
        }          },
      (err:HttpErrorResponse) => {
        this.paymentProcessedError(err.error);
      }
    );
  }

  /* Opens handler with config/callback for annual plan */
  openStripeAnnual(){
    this.dismissActiveModal();

    if (!this.stripeCard || !this.stripeCard.brand){
      this.changePayment = true;
    }
    
    if (!this.changePayment && this.stripeCard && this.stripeCard.brand){
      this.processAnnualPayment(null, this.couponCode);
    }else{
      this.stripeHandler.open({
        description: 'Annual subscription plan',
        amount: ANNUAL_RATE,
        panelLabel: 'Subscribe', // Button text in stripe handler
        token: token => {
          this.processAnnualPayment(token, this.couponCode);
        }
      });
    }
  }

  processAnnualPayment(token:string, coupon:string){
    this.loadingText = "Subscribing user..."
    this.isLoading = true;
    this.paymentService.processAnnualPayment(token, coupon).subscribe(
      (results) => {
        if (results['error']){
          this.paymentProcessedError(results['error']);
        }else{
          this.verifyPaymentStatus();
        }          
      },
      (err:HttpErrorResponse) => {
        this.paymentProcessedError(err.error);
      }
    );
  }

  /* Displays error message for failure to subscribe */
  paymentProcessedError(message:any){
    this.paymentProcessedModalBody = "Failed to subscribe to Breathe: " + message;
    this.paymentProcessedModalTitle = "Error";
    this.paymentProcessedModalButton = "Dismiss";
    this.isLoading = false;
    this.activeModal = this.modalService.open(this.paymentProcessedModal);
  }

  /* Opens stripe configured to modify payment information */
  openStripeModify(){
    this.stripeHandler.open({
      description: "Update payment information",
      panelLabel: "Submit",
      token: token => {
        this.isLoading = true;
        this.loadingText = "Updating payment information...";
        this.paymentService.modifyCustomer(token).subscribe(
          results => {
            this.paymentProcessedModalButton = "Dismiss";
            if (results['error']){
              console.error(results['error']);
              this.paymentProcessedModalBody = "Failed to update payment information: " + results['error'];
              this.paymentProcessedModalTitle = "Error";
            }else{
              let cardObject = results["sources"]["data"][0];
              this.stripeCard = new StripeCard(cardObject['brand'], cardObject['last4'], cardObject['exp_month'], cardObject['exp_year']);
              this.paymentProcessedModalBody = "Your payment information was successfully updated";
              this.paymentProcessedModalTitle = "Information Updated";
            }
          },
          (err:HttpErrorResponse) => {
            this.paymentProcessedModalTitle = "Error";
            this.paymentProcessedModalBody = "There was an error while attempting to update your information: " + err.error;
            this.paymentProcessedModalButton = "Dismiss";
          },
          () =>{
            this.isLoading = false;
            this.activeModal = this.modalService.open(this.paymentProcessedModal);
          }
        );
      }
    });

  }


  /* Opens delete payment modal */
  openStripeDelete(){
    this.activeModal = this.modalService.open(this.paymentDeleteModal);
  }

  /* Opens subscription modify modal */
  openSubscriptionModify(){
    this.activeModal = this.modalService.open(this.changeSubscriptionModal), {size: 'lg'};
  }

  /* Opens subscription confirm */
  openSubscriptionConfirm(){
    this.activeModal = this.modalService.open(this.subscribeConfirmationModal);
  }

  openSubscriptionCancel(){
    this.confirmModal = this.modalService.open(this.cancelSubscriptionModal);
  }

  cancelSubscription(){
    this.isLoading = true;
    this.loadingText = "Canceling subscription...";
    if (this.confirmModal){
      this.confirmModal.close();
      this.confirmModal = null;
    }

    this.dismissActiveModal();
    this.paymentService.cancelSubscription().subscribe(
      (results) => {
        this.paymentProcessedModalButton = "Dismiss";
        if (results["error"]){
          this.paymentProcessedModalBody = "Failed to cancel subscription: " + results["error"];
          this.paymentProcessedModalTitle = "Error";
        }else{
          this.paymentProcessedModalBody = "Subscription successfully canceled";
          this.paymentProcessedModalTitle = "Subscription Cancelled";
          this.stripeSubscription = new StripeSubscription();
          this.userService.subscriptionStatus = "canceled"; // With one 'L', following stripe's example
        }
      },
      (err:HttpErrorResponse) => {
        this.paymentProcessedModalButton = "Dismiss";
        this.paymentProcessedModalBody = "Failed to cancel subscription: " + err.error;
        this.paymentProcessedModalTitle = "Error";
        this.isLoading = false;
        this.activeModal = this.modalService.open(this.paymentProcessedModal);
      },
      () => {
        // Why does this not trigger in the event of an error? It's whole point is to be there in both cases
        this.isLoading = false;
        this.activeModal = this.modalService.open(this.paymentProcessedModal);
      }
    );
  }

  /* Verifies that status after payment is what it should be after subscribing(probably 'active') */
  verifyPaymentStatus(){
    this.loadingText = "Verifying that subscription was successful...";
    this.paymentService.getStatus().subscribe(
      (results) => {
        this.changePayment = false; // Reset checkbox
        this.couponCode = "";
        status = results['status'];
        this.userService.subscriptionStatus = status;
        if (status === 'active' ||  status === 'past_due' || status === 'trialing'){
          // DO SOMETHING HAPPY
          this.paymentProcessedModalTitle = "Successfully Subscribed to Breathe"
          this.paymentProcessedModalBody = "Take a deep breath, and let's begin.";
          this.paymentProcessedModalButton = "Let's go!";
        }else{
          this.paymentProcessedModalTitle = "Verification Failed"
          this.paymentProcessedModalBody = "Subscription verification failed: status was '" + status + "'.";
          this.paymentProcessedModalButton = "Dismiss";
        }
      },
      (err:HttpErrorResponse) =>{
        this.paymentProcessedModalBody = "There was an error retrieving your subscription status: " + err.error;
        this.paymentProcessedModalTitle = "Error";
        this.paymentProcessedModalButton = "Dismiss";
        this.isLoading = false;
        this.activeModal = this.modalService.open(this.paymentProcessedModal);
      },
      () => {
        this.isLoading = false;
        this.activeModal = this.modalService.open(this.paymentProcessedModal);
        this.getCustomer();
      }
    );
  }

  /* Deletes Customer's current payment method */
  deleteInfo(){
    this.dismissActiveModal();
    this.isLoading = true;
    this.loadingText = "Deleting payment info...";
    this.paymentService.deletePaymentInfo().subscribe(
      (results) => {
        this.paymentProcessedModalButton = "Dismiss";
        if (results['error']){
          this.paymentProcessedModalTitle = "Error";
          this.paymentProcessedModalBody = "There was an error deleting your payment information: " + results['error'];
        }else{
          this.paymentProcessedModalTitle = "Payment Method Removed"
          this.paymentProcessedModalBody = "Successfully deleted your payment information ";
          this.stripeCard = new StripeCard();
        }
      },
      (err:HttpErrorResponse) => {
        this.paymentProcessedModalButton = "Dismiss";
        this.paymentProcessedModalTitle = "Error";
        this.paymentProcessedModalBody = "There was an error while attempting to delete your payment information: " + err.error;
      },
      () => {
        this.isLoading = false;
        this.activeModal = this.modalService.open(this.paymentProcessedModal);
      }
    );
  }


  /* Switches subscription plans */
  changeSubscription(){
    this.dismissActiveModal();
    this.isLoading = true;
    this.loadingText = "Changing subscription plan...";
    let  new_subscription:string;
    if (this.stripeSubscription.plan == "monthly"){
      new_subscription = "annual";
    }else if (this.stripeSubscription.plan == "annual"){
      new_subscription = "monthly";
    }else{
      return; // Should not be allowed to enter this function otherwise, but just in case
    }

    this.paymentService.changeSubscription(new_subscription).subscribe(
      (results) => {
        this.paymentProcessedModalButton = "Dismiss";
        if (results['error']){
          this.paymentProcessedModalTitle = "Error";
          this.paymentProcessedModalBody = "Unable to change subscription: " + results['error'];
        }else{
          this.paymentProcessedModalTitle = "Subscription Changed";
          this.stripeSubscription = new StripeSubscription(results['id'], results['current_period_start'], results['current_period_end'], results['plan']['id']);
          this.paymentProcessedModalBody = "New Plan: " + this.stripeSubscription.plan.charAt(0).toUpperCase() + this.stripeSubscription.plan.slice(1);
        }
      },
      (err:HttpErrorResponse) => {
        this.paymentProcessedModalButton = "Dismiss";
        this.paymentProcessedModalTitle = "Error";
        this.paymentProcessedModalBody = "There was an error while attempting to change your subscription: " + err.error;
      },
      () => {
        this.isLoading = false;
        this.activeModal = this.modalService.open(this.paymentProcessedModal);
      }
    );
  }

  /* Close Stripe handler on navigation */
  @HostListener('window:popstate')
  onPopstate() {
    this.stripeHandler.close()
  }

  /* Close currently active modal */
  dismissActiveModal(){
    if (this.activeModal){
      this.activeModal.close();
      this.activeModal = null;
    }
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