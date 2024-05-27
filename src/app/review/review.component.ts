import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import {  Router } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
import { LoadingBarService } from '@ngx-loading-bar/core';

import { GlobalsService } from './../../providers/globals-service';
import { UserService } from './../../providers/user-service';
import { AuthService } from './../../providers/auth-service';
import { EventsService } from './../../providers/events-service';
import { CartComponent } from '../cart/cart.component';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {

  rating = 1;
  review = '';
  @Input() showRateModal: Number; 
  @Input() orderItem: any; 
  @Output() showRateModalChange = new EventEmitter<Number>();
  @Output() orderItemChange = new EventEmitter<any>();

  constructor(private globals: GlobalsService, public userService: UserService, public loader: LoadingBarService, public router: Router, public auth: AuthService, public location: Location, private events: EventsService) {
    
    
  }

  ngOnInit() {
    console.log(this.orderItem);
  }


  closePostModal() {
    this.showRateModal = -1;
    this.showRateModalChange.emit(this.showRateModal);
  }

  setRating(number){
    this.rating = number;
  }

  async postReview() {
    let data = {
      eid: this.orderItem._id,
      rate: this.rating,
      comment: this.review,
    };
    this.loader.start();
    try {
      let review = await this.userService.postReview(data);
      this.orderItem.comments.push(review);
      this.orderItemChange.emit(this.orderItem);
      this.closePostModal();
    } catch(err) {}
    this.loader.complete();
  }

}
