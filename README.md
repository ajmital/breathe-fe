# BreatheFe

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.4.7.

The project uses Angular 5. The most significant change between this, angular 4, and angular 2 is that the `http-client` service was revamped as the `http` service, there is no need to explicitly map requests back to json, and it is significantly more efficient in compilation.

More detailed documentation will be added soon, breaking down specific methods, variables, and how interactions are handled.

## Breathe FE Structure
Currently, the project assumes the Breathe API is located on the same server as these pages are hosted, and each service defines a variable at the top pointing to this.

Additional static pages are assumed to be hosted at /static/fe/

There are four [components](https://angular.io/guide/architecture-components) which are structured as:

    Main
      |-- Dashboard
      |-- Food
      |-- Settings

Each of the three child components contain an `update()` method which should be called after changes are made.

Additionally, there are four [services](https://angular.io/guide/architecture-services) which provide a place for methods and variables that multiple components use:
 - `UserService`
 - `FoodService`
 - `PaymentService`
 - `DrawService`

## Components

### Main
The Main component houses pieces used in all components of the dashboard:
 - Navbar
 - Side nav menu
 - Modals for initial setup
 - Loading overlay

The Main component essentially acts as a root hub for the other components, and controls which components are displayed (see `MainComponent.show()` method). It also utilizes the `UserService` service to retrieve initial user info, and will only display child components after this process is completed.

Additionally, as the "parent" component of the other components, this component can trigger any child components functions (via the [@ViewChild](https://angular.io/api/core/ViewChild) decorator) or receive [events](https://toddmotto.com/component-events-event-emitter-output-angular-2) from child components. This was useful in two cases:
 - Switching to sibling component (e.g. from Dashboard to Food)
 - Opening a modal that "belongs" to another component
 
 A component cannot see its siblings, so instead, the component could trigger an event in the Main component which would allow the Main component to select a child component to display or open a modal.

### Dashboard
The Dashboard component is the heart of the Breathe portal, displaying user data and providing controls to add weight or food. This dashboard displays data according to the date specified by the user. Its `update()` method first retrieves the user's results for the specified date, then retrieves their food entries, summing their total macronutrients and storing them, and finally retrieves the user's weight entries. All these rely on corresponding methods in the `UserService` service to make the HTTP requests.

The Dashboard component also contains some food entry capabilities which are identical to those in the Food Component. These should both eventually be encapsulated in the FoodService service or the Main component. These include the ability to:
 - Get detailed information about a food entry and display it in a modal
 - Multiselect food to repeat a series of entries
 - Repeat foods
 
 ### Food
 The Food component provides search capabilities and food entry. Its `update()` method retrieves a user's most recent food entries using the `UserService.getFood()` method. While counterintuitive, this method involves data associated with a user, and so is not in  `FoodService`.
 
 Apart from the ability to search for foods, the Food component also contains food entry capabilites nearly identical to those in the Dashboard component (see above). These should eventually be encapsulated into a service or the main component (or both).
 
 ### Settings
 The Settings component allows the user to edit their profile and manage their subscription. This component contains a significant amount of modals which mirror the components subscription-related functions:
  - `paymentProcessedModal`: After receiving a response from the server, either a success or error message is displayed here
  - `paymentDeleteModal`: Confirmation dialog for deleting user's payment information
  - `changeSubscriptionModal`: Confirmation dialog for switching user's subscription type
  - `subscribeConfirmationModal`: Selecting subscription plan for unsubscirbed users
  - `cancelSubscriptionModal`: Confirmation dialog to cancel subscription
 
 To update a user's profile, the Settings component uses two-way data-binding on form inputs with a temporary User object. This object is initially populated with the value of `UserService.user` and when the user wishes to save, `UserService.user` is set to the temporay object, and the `UserService.setUser()` method is called.

## Services
### UserService
The `UserService` service contains all methods/variables that require user authentication; however, given how large this service is, it no longer makes sense to organize it this way and it should be split into smaller services.

The service contains the user's data so that it is accessible by all components. It also maintains the user's subscription status. Some of its less obvious methods include getting/setting weight, getting the user's food, and adding the user's food.

### FoodService
The `FoodService` service contains food-related methods that do not depend on the user (searching for food, retrieving details from nutritionix). 

### PaymentService
The `PaymentService` service handles all requests to the Stripe-related endpoints on the Breathe backend.

It defines two classes: `StripeSubscription` and `StripeCard` which are used to store information about the user's subscription and current payment method.

All HTTP request Observables are shared with [shareReplay()](https://www.learnrxjs.io/operators/multicasting/sharereplay.html):

    let request = this.http.delete(
      '/api/stripe/customer/delete/',
      {headers: this.headers}
     ).shareReplay();

This enables both the service and the caller to handle HTTP events without repeating the request by caching the most recent copy.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

The current setup allows only for authentication from the same server as the backend, so the development server will not be helpful. The best workaround is to set up an Apache instance, with the Breathe-DRF project set up as a WSGI application, and then point all requests to `/fe/` to the `dist/` folder. This ensures that every time the project is built, it can immediately be tested.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build
To build the project for QA, run `ng build --env=qa --base-href /fe/ --deploy-url /fe/`. The `env` flag sets the environment. The main use of the environment in Breathe-Fe is to switch between live/testing Stripe services. The `--base-href` and `--deploy-url` flags are used because the default assumption for Angular projects is that they are hosted at the server root, but in this case, they are hosted under /fe.

To build the project for production, run `ng build -prod --base-href /fe/ --deploy-url /fe/`.

The output files will be placed in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
