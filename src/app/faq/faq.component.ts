import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import {  Router, ActivatedRoute } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';

import { GlobalsService } from '../../providers/globals-service';
import { UserService } from '../../providers/user-service';
import { AuthService } from '../../providers/auth-service';
import { EventsService } from '../../providers/events-service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  faqs = [];
  isLoaded:boolean = false;
  page = 1
  recordPerPage = 1000;
  noMorePage = false;
  showInfiniteScrollLoader:boolean = false;
  
  skeletonLoading:boolean = true;
  totalSkeletons = [1,2,3,4,5,6,7,8]

  constructor(public globals: GlobalsService, public userService: UserService, public loader: LoadingBarService, public router: Router, public auth: AuthService, public location: Location, public activatedRoute: ActivatedRoute, private events: EventsService) {

    
    
  }
  
  ngOnInit(): void {
      
    this.getFAQs();

  }

  getFAQs() {
    this.isLoaded = false;
    this.skeletonLoading = true;
    let params = {
      perpage: this.recordPerPage,
      page: this.page,
    }
    this.loader.start();
    this.userService.faqListing(params).then(data => {
      if(data){
        this.faqs = data;
      }
      this.loader.complete();
      this.skeletonLoading = false;
      this.isLoaded = true;
    }, err => {
      this.loader.complete();
      this.skeletonLoading = false;
      this.isLoaded = true;
    });
  }

}
