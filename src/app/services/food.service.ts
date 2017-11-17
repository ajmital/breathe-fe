import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

const api_url:string = "http://localhost/cgi-bin/";

@Injectable()
export class FoodService {

  constructor(public http:Http) {
  }

  search(query_string:string){
    return this.http.post(api_url + "search.py", {query: query_string}).map(res => res.json());
  }

  getDetails(item_id:string){
    return this.http.post(api_url + "detail.py", {nix_item_id: item_id}).map(res => res.json());
  }
}
