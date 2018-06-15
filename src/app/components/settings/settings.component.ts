import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  isLoading:boolean = false;
  constructor(private userService:UserService) { }

  ngOnInit() {
  }

  save(){
    this.isLoading = true;
    this.userService.setUser().subscribe(
      (results) => {},
      (err:HttpErrorResponse) => {
        console.error(err);
      },
      () => {
        this.isLoading = false;
      }
    )
  }

  cancel(){
    this.isLoading = true;
    let request = this.userService.getUser(); // Refresh user details
    request.subscribe(
      (results) => {},
      (err) => {},
      () => {
        this.isLoading = false;
      }
    );
  }

}