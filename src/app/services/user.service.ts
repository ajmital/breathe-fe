import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

const api_url:string = "http://localhost:8000/api/";

@Injectable()
export class UserService {

  user:User = new User();
  // TODO replace with session
  options:RequestOptions = new RequestOptions(
    {
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": "Token 3293f8cbbe16515a56d77ce352421d26241e80ae"
      })
    }
  );


  
  constructor(public http:Http) {
  }

  getFood(){
    return this.http.get(api_url + "foods/", this.options).map(res=> res.json());
  }

  getWeights(){
    return this.http.get(api_url + "weights/", this.options).map(res => res.json()); 
  }

  addWeight(weight:number, time:string){
    return this.http.post(api_url + "weights/", {"email":this.user.email, "value":weight, "timestamp":time}, this.options).map(res => res.json());
  }

  getUser(){
    return this.http.get(api_url + "users/retrieve/", this.options).map(res => res.json());
  }

  setUser(){

    let userObject = {
      weight: this.user.weight,
      gender: this.user.gender,
      height: this.user.height,
      full_name: this.user.full_name,
      birth_month: this.user.birth_month,
      email: this.user.email,
      birth_year: this.user.birth_year
    };

    return this.http.put(api_url + "users/update/", userObject, this.options).map(res => res.json());
  }

  getResults(){
    return this.http.get(api_url + "results/retrieve/", this.options).map(res => res.json());    
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