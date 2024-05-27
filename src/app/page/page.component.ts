import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {  Router, ActivatedRoute } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';

import { GlobalsService } from './../../providers/globals-service';
import { UserService } from './../../providers/user-service';
import { AuthService } from './../../providers/auth-service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PagesComponent implements OnInit {

  pageUrl;
  page;
  loaded = false;

  constructor(public globals: GlobalsService, public userService: UserService, public loader: LoadingBarService, public router: Router, public auth: AuthService, public location: Location, public activatedRoute: ActivatedRoute) {

    

   }

  ngOnInit() {

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.activatedRoute.params.subscribe(params => {
      this.pageUrl = params['pageUrl'];
      this.page = this.globals.pages.find(el => el.url == this.pageUrl);
      console.log(this.globals.pages);
      this.getPageInfo();
    });
    
  }

  async getPageInfo(){
    this.loader.start();
    try {
      await this.userService.pageListing();
      this.page = this.globals.pages.find(el => el.url == this.pageUrl);
    } catch(err) {}
    this.loader.complete();
    this.loaded = true;

    // this.pageTitle  = pageName;

    // switch (this.pageTitle) {
    //   case 'about-us':
    //     this.pageTitle = 'About Us'
    //     break;
    //   case 'privacy-policy':
    //     this.pageTitle = 'Privacy Policy'
    //     break;
    //   case 'terms-and-conditions':
    //     this.pageTitle = 'Terms and Conditions'
    //     break;
    //   case 'history':
    //     this.pageTitle = 'History'
    //     break;
    //   case 'location':
    //     this.pageTitle = 'Location'
    //     break;
    //   case 'cookie-policy':
    //     this.pageTitle = 'Cookie Policy'
    //     break;
    //   case 'faq':
    //     this.pageTitle = 'FAQs'
    //     break;
    //   case 'warrenty':
    //     this.pageTitle = 'Warrenty'
    //     break;
    //   case 'return-refund':
    //     this.pageTitle = 'Return/Refund'
    //     break;
    //   case 'support':
    //     this.pageTitle = 'Support'
    //     break;
    //   case 'news-and-media':
    //     this.pageTitle = 'News and Media'
    //     break;
    // }



  }

}
