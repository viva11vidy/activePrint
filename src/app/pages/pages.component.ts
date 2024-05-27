import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {  Router, ActivatedRoute } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';

import { GlobalsService } from './../../providers/globals-service';
import { UserService } from './../../providers/user-service';
import { AuthService } from './../../providers/auth-service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {

  pageName;
  pageTitle;

  constructor(private globals: GlobalsService, public userService: UserService, public loader: LoadingBarService, public router: Router, public auth: AuthService, public location: Location, public activatedRoute: ActivatedRoute) {

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.activatedRoute.params.subscribe(params => {
      this.pageName = params['pagename'];
      if(this.pageName == 'all') {
        this.pageName = false; 
      } else {
        this.getPageInfo(this.pageName);
      }
    });

   }

  ngOnInit() {

    
    
  }

  getPageInfo(pageName){
    console.log(pageName);
    this.pageTitle  = pageName;

    switch (this.pageTitle) {
      case 'about-us':
        this.pageTitle = 'About Us'
        break;
      case 'privacy-policy':
        this.pageTitle = 'Privacy Policy'
        break;
      case 'terms-and-conditions':
        this.pageTitle = 'Terms and Conditions'
        break;
      case 'contact-us':
        this.pageTitle = 'Contact Us'
        break;
      case 'order-tracking':
        this.pageTitle = 'Order Tracking'
        break;
      case 'help-centers':
        this.pageTitle = 'Help Centers'
        break;
      case 'faq':
        this.pageTitle = 'FAQ'
        break;
    }



  }

}
