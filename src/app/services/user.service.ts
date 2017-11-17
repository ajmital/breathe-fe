import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

const api_url:string = "http://localhost/cgi-bin/";

@Injectable()
export class UserService {

  constructor(public http:Http) {
  }

  getWeights(){
    return this.http.get(api_url + "weights.py").map(res => res.json()); 
  }

  addWeight(email:string, weight:number, time:string){
  
    let options:RequestOptions = new RequestOptions(
      {
        headers: new Headers({
          "Content-Type": "application/json"
        })
      }
    );
    return this.http.post(api_url + "weights.py", {"email":email, "value":weight, "timestamp":time}, options).map(res => res.json());
  }

  getUser(){
    return this.http.get(api_url + "users.py").map(res => res.json());
  }

  setUser(userObject){
    let options:RequestOptions = new RequestOptions(
      {
        headers: new Headers({
          "Content-Type": "application/json"
        })
      }
    );
    return this.http.post(api_url + "users.py", userObject, options).map(res => res.json());
  }

  getResults(){
    return this.http.get(api_url + "results.py").map(res => res.json());    
  }

}
