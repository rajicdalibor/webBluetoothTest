import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.css']
})
export class UserDialogComponent implements OnInit {
  token: any;
  displayName: string;
  numberOfFollowers: string;
  id: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.token = this.data['token'];
    this.displayName = this.data['userData'].displayName;
    this.numberOfFollowers = this.data['userData'].numberOfFollowers;
    this.id = this.data['userData'].id;
  }
}
