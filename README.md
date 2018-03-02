# BreatheFe

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.4.7.

The project uses Angular 5. The most significant change between this, angular 4, and angular 2 is that the `http-client` service was revamped as the `http` service, there is no need to explicitly map requests back to json, and it is significantly more efficient in compilation.

## Breathe FE Structure
Currently, the project assumes the Breathe API is located at `localhost:8000`, and each service defines a variable at the top pointing to this.

The user-data and food components are currently placed together in a single "main" component using tabs.  The landing-page component provides a very simple login form (username and password) which POST to the Django server's rest-authentication URL (this will have to change later).

The registration page is nonfunctional, because although it allows a user to authenticate into Django, it does not create a Breathe user, and none of their details will be saved in the database. This is because the rest-authentication plugin was not connect to some method to create a Breathe user and place them in the database.

All services were consolidated into a single `UserService`, to simplify access to the API. There is a `user` class defined in the `UserService` as well as in other components, which is a redunancy left over from initial development. The reason for placing user information in the `UserService` is to allow different components to share that data if they are on the same page.

## Credential Management

Because the infrastructure for logging in from a browser did not exist, I used the existing rest-authentication plugin for Django to emulate sign in. Credentials were stored in a local or session storage variable called 'user'.  Currently, the landing page is set to navigate to the main page if this variable is set, and if it is not set, the main page will redirect to the landing page.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
