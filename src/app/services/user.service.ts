import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

const api_url:string = "http://localhost/cgi-bin/";

@Injectable()
export class UserService {

  user:User = new User();
  
  constructor(public http:Http) {
  }

  getFood(){
    return this.http.get(api_url + "foods.py").map(res=> res.json());
  }

  getWeights(){
    return this.http.get(api_url + "weights.py").map(res => res.json()); 
  }

  addWeight(weight:number, time:string){
  
    let options:RequestOptions = new RequestOptions(
      {
        headers: new Headers({
          "Content-Type": "application/json"
        })
      }
    );
    return this.http.post(api_url + "weights.py", {"email":this.user.email, "value":weight, "timestamp":time}, options).map(res => res.json());
  }

  getUser(){
    return this.http.get(api_url + "users.py").map(res => res.json());
  }

  setUser(){
    let options:RequestOptions = new RequestOptions(
      {
        headers: new Headers({
          "Content-Type": "application/json"
        })
      }
    );

    let userObject = {
      polynomial_coefficients: "string",
      bearer_token: "string",
      oauth_tokens: "string",
      weight: this.user.weight,
      processed_on: "string",
      gender: this.user.gender,
      age: this.user.age,
      token_source: "string",
      last_hr_sync: "string",
      height: this.user.height,
      last_calculations_ran_on: "string",
      token_str: "string",
      authorized: true,
      full_name: this.user.full_name,
      birth_month: this.user.birth_month,
      password: "password",
      email: this.user.email,
      birth_year: this.user.birth_year
    };

    return this.http.post(api_url + "users.py", userObject, options).map(res => res.json());
  }

  getResults(){
    return this.http.get(api_url + "results.py").map(res => res.json());    
  }

}

class User{
  email:string;
  weight:number;
  gender:string;
  age:number;
  height:number;
  full_name:string;
  birth_year:number;
  birth_month:number;
  maintain:number;
  gradual:number;
  moderate:number;
  aggressive:number;
  co2:number;
  constructor(){}
}