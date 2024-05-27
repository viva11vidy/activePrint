import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subscription, fromEvent  } from 'rxjs';
import { map, filter, catchError, mergeMap, debounceTime  } from 'rxjs/operators';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { LocalStorage  } from '@ngx-pwa/local-storage';

import { AuthService } from './../providers/auth-service';
import { GlobalsService } from './../providers/globals-service';
import { UserService } from './../providers/user-service';
import { EventsService } from './../providers/events-service';

declare var $;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({transform: 'translateX(100%)', opacity: 0}),
        animate('300ms', style({transform: 'translateX(0)', opacity: 1}))
      ]),
      transition(':leave', [
        style({transform: 'translateX(0)', opacity: 1}),
        animate('300ms', style({transform: 'translateX(100%)', opacity: 0}))
      ])
    ]),
    trigger('callAnimation', [
      transition(':enter', [
        style({transform: 'translateY(100%)', opacity: 0}),
        animate('300ms', style({transform: 'translateY(0)', opacity: 1}))
      ]),
      transition(':leave', [
        style({transform: 'translateY(0)', opacity: 1}),
        animate('300ms', style({transform: 'translateY(100%)', opacity: 0}))
      ])
    ]),
    trigger(
      'leaveAnimation', [
        transition(':leave', [
          style({opacity: 1}),
          animate('300ms', style({opacity: 0}))
        ])
      ]
    ),

    
  ],
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {


  loginScreen:boolean = true;
  signupScreen:boolean = false;
  forgotPasswordScreen:boolean = false;

  signUpFirst:boolean = true;
  signUpSecond:boolean = false;

  forgetFirst:boolean = true;
  forgetSecond:boolean = false;

  fname;
  lname;
  email;
  password;
  confirmpassword;
  otp_request_id;
  otp;

  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  newsletterEmail = '';
  newsletterName = '';

  categorySkeleton:boolean = true;
  categories = [];

  // For search
  @ViewChild('searchInputElement') searchInputElement: ElementRef;
  skeletonDemoLoading = [0,1,2,3];
  searchString : string = '';
  currentPage = 1;
  perPage = 1000;
  clearIcon:boolean = false;
  isLoaded = false;
  skeletonLoader;

  private debouncedInputSubscription: Subscription = new Subscription();
  searchSuggestion:boolean = false;
  suggestedProducts = [];
  suggestedKeywords = [];
  suggestionSkeletonLoader:boolean = false;

  splittedSuggestedKeywords = [];
  showingSuggestedKeywordValue = '';
  showingSuggestedKeyword:boolean = false;
   // For search ENDS

  showNewsletter = false;


  mobileSideMenu:boolean = false



  constructor(public auth: AuthService,  public globals: GlobalsService, private events: EventsService, public loader: LoadingBarService, public userService: UserService, public router: Router, public location: Location, public storage: LocalStorage) {

    this.initializeApp();
    this.getSettings();
    this.getCategories();
    this.getPages();
    // this.auth.unsetUser();
    
  }

  toggleMobileSideMenu(){
    this.mobileSideMenu = !this.mobileSideMenu;
  }

  resetAllInput(){
    this.fname = '';
    this.lname = '';
    this.email = '';
    this.password = '';
    this.confirmpassword = '';
    this.otp_request_id = '';
    this.otp = '';
  }

  getCategories(){
    this.userService.categoryListing({page:1}).then(data => {
      if(data){
        this.categories = data;
        this.categories.forEach((element, index) => {
          // if(element.child && element.child.length) {
          //     element.child.forEach((subElement, index) => {
          //       this.userService.productListing({cid: subElement._id, perpage:10, page:1}).then(data => {
          //         if(data){
          //           subElement.products = data;
          //         }
          //       }, err => {
          //       });
          //   });
          // } else {
          //   this.userService.productListing({cid: element._id, perpage:10, page:1}).then(data => {
          //     if(data){
          //       element.products = data;
          //     }
          //   }, err => {
          //   });
          // }
        });
        this.loader.complete();
        this.categorySkeleton = false;
      }
    }, err => {
      this.loader.complete();
      this.skeletonLoader = false;
    });

    
  }

  async getSettings(){
    try{
      let data = await this.userService.settings();
    } catch(err) {

    }
  }

  async getPages(){
    try{
      let data = await this.userService.pageListing();
    } catch(err) {

    }
  }

  goToCategoryDetailsPage(catID,catSlug){
    this.router.navigate(['/category/'+catSlug+'/'+catID]); 
  }

  goToSubCategoryCategoryPage(catID,catSlug){
    this.router.navigate(['/category/subcategory/'+catSlug+'/'+catID]); 
  }

  goToPages(pageName){
    console.log(pageName);
    this.router.navigate(['/pages/'+pageName]); 
  }

  
  showSignUp(){
    this.loginScreen = false;
    this.signupScreen = true;
    this.forgotPasswordScreen = false;
    this.resetAllInput();
  }
  showLogin(){
    this.loginScreen = true;
    this.signupScreen = false;
    this.forgotPasswordScreen = false;
    this.resetAllInput();
  }
  showForgotPassword(){
    this.loginScreen = false;
    this.signupScreen = false;
    this.forgotPasswordScreen = true;
    this.resetAllInput();
  }
  showSignUpFirst(){
    this.signUpFirst = true;
    this.signUpSecond = false;
  }

  



  getForgotOTP()  : Promise<any>{
    let data = {
      platform:"Email",
      uique_platform_id : this.email,
      purpose : "Reset Password",
    }
    return new Promise((resolve, reject) => {
      this.auth.getOTP(data).then(data => {
        resolve(data);
        if(data){
          this.otp_request_id = data._id;
          this.forgetFirst = false;
          this.forgetSecond = true;
        }
      }, (err) => {
        console.log(err);
        this.loader.complete();
      }); 
    });
  } 

  changePassword(){
    let data = {
      otp_request_id : this.otp_request_id,
      otp : this.otp,
      new_password: this.password
    }
    this.loader.start();
    this.auth.forgotPwdReset(data).then(data => {
      if(data) {
        if(data){
          this.showLogin();
        }
        this.loader.complete();
      } else {
        this.loader.complete();
      }
    }, (err) => {
      console.log(err);
      this.loader.complete();
    });
  }

  showForgotFirst(){
    this.forgetFirst = true;
    this.forgetSecond = false;
  }




  signup(){
    let data = {
      title : "Mr.",
      fname : this.fname,
      lname : this.lname,
      email : this.email,
      password : this.password
    }
    this.loader.start();
    this.auth.signup(data).then(data => {
      if(data) {
        this.getSignupOTP().then(data => {
          if(data){
            this.loader.complete();
            this.otp_request_id = data._id;
            this.signUpFirst = false;
            this.signUpSecond = true;
            this.fname = '';
            this.lname = '';
            this.password = '';
            this.confirmpassword = '';
          }
        }, (err) => {
          console.log(err);
          this.loader.complete();
        }); 
      } else {
        this.loader.complete();
      }
    }, (err) => {
      console.log(err);
      this.loader.complete();
    }); 
  }

  getSignupOTP() : Promise<any>{
    let data = {
      platform:"Email",
      uique_platform_id : this.email,
      purpose : "AC Verification",
    }
    return new Promise((resolve, reject) => {
      this.auth.getOTP(data).then(data => {
        resolve(data);
      }, (err) => {
        console.log(err);
        this.loader.complete();
      }); 
    });
  } 

  finalSignup(){
    let data = {
      otp_request_id : this.otp_request_id,
      otp : this.otp,
    }
    this.loader.start();
    this.auth.verifyAccountOTP(data).then(data => {
      if(data) {
        this.otp = "";
        this.globals.closeLoginModal();
        this.loader.complete();
      } else {
        this.loader.complete();
      }
    }, (err) => {
      console.log(err);
      this.loader.complete();
    }); 
  }

  login(){
    let data = {
      email : this.email,
      password : this.password,
    }
    this.loader.start();
    this.auth.login(data).then(data => {
      if(data) {
        if(this.auth.authenticated()) {
          this.globals.closeLoginModal();
          this.loader.complete();
          // this.location.replaceState('/');
          // // this.location.reload();
          // window.location.reload();
          // this.router.navigate(['/home']);
        } else {
          this.auth.logout();
        }

      } else {
        this.loader.complete();
      }
    }, (err) => {
      console.log(err);
      this.loader.complete();
    }); 
  }

  async subscribeNewsletter(){
    var data = {
      email: this.newsletterEmail.toLowerCase(),
      name: this.newsletterName,
    };
    this.loader.start();
    try {
      let response = await this.userService.subscribeNewsletter(data);
      if(response){
        this.newsletterEmail = this.auth.user.email ? this.auth.user.email : '';
        this.newsletterName = this.auth.user.name ? this.auth.user.name : '';
        this.globals.showSuccessAlert('Thank you for subscribing to our newsletter. We will notify about our recent updates in your email.');
        this.showNewsletter = false;
      }
    } catch(err) {
      console.log(err);
    }
    this.loader.complete();
  }

  async unsubscribeNewsletter(){
    var data = {
      email: this.newsletterEmail.toLowerCase(),
    };
    this.loader.start();
    try {
      let response = await this.userService.unsubscribeNewsletter(data);
      if(response){
        this.newsletterEmail = this.auth.user.email ? this.auth.user.email : '';
        this.newsletterName = this.auth.user.name ? this.auth.user.name : '';
        this.globals.showSuccessAlert('You are not unsubscribed from our mailing list. Please subscribe again to get recent updates about us.');
      }
    } catch(err) {
      console.log(err);
    }
    this.loader.complete();
  }


  initializeApp() {
    this.auth.getToken();
    // this.auth.unsetUser();
    this.auth.validateToken().then(data => {
     console.log('Logged In');     
    }, err => {
      // this.location.replaceState('/');
      // this.router.navigate(['/login']); 
    });
    


  }

  isAuthenticated() {
    return this.auth.authenticated();
  }

  



  ngOnInit() {
    
  }

  

  ngAfterViewInit(){
    this.events.listen('validateTokenCallComplete', async complete => {
      if(complete) {
        // FOR SEARCH
        setTimeout(() => {
          const input = this.searchInputElement.nativeElement;
          const obs = fromEvent(this.searchInputElement.nativeElement, 'keyup');
          const input$ = obs.pipe(map(i => i));
          const debouncedInput = input$.pipe(debounceTime(500));
          this.debouncedInputSubscription.add(debouncedInput.subscribe(val => {
            this.performSearch();
          }));
        }, 100);

        // FOR NEWSLETTER

        let subscriptionStatus = false;
        if(this.auth.user){
          try {
            subscriptionStatus = await this.userService.checkNewsletterSubscription();
            subscriptionStatus = true;
          } catch(err) {
            console.log(err);
          }
        }

        this.newsletterEmail = this.auth.user.email ? this.auth.user.email : '';
        this.newsletterName = this.auth.user.name ? this.auth.user.name : '';
        if(!subscriptionStatus){
          setTimeout(() => {
            this.showNewsletter = true;
          }, 5000);
        }
      } 
    });
  }

  setSearchTextAndPerformSearch(searchText){ 
    this.searchString = searchText;
    setTimeout(() => {
      this.performSearch();
    });
  }



  checkSearchEmpty(){
    if (this.searchString != '') {
      this.clearIcon = true;
    } else {
      this.clearIcon = false;
    }
  }

  clearSearch(){
    this.searchString = '';
    this.checkSearchEmpty();
    this.showingSuggestedKeyword = false;  // if click on close icon from input then 'showing result text' will be hidden
    this.resetSearch();
    this.searchSuggestion = false;
  }

  resetSearch() {
    this.currentPage = 1;
    this.isLoaded = false;
    //this.getCategories(false);
  }
  
  performSearch(){
    this.resetSearch();
    if(this.searchString.length < 2) {
      this.searchSuggestion = false;
      this.suggestionSkeletonLoader = false;
      return false;
    } else {
      this.searchSuggestion = true;
      this.suggestionSkeletonLoader = true;
      this.suggestedKeywords = [];
      this.getProductSuggestion();
    }
  }

  outerClick(){
    this.searchSuggestion = false;
  }

  getProductSuggestion(){
      this.userService.productSuggestionListing({perpage : this.perPage, page: this.currentPage, q: this.searchString}).then(data => {
        if(data){
          this.suggestionSkeletonLoader = false;
          this.suggestedProducts = data.entities;
          this.suggestedKeywords = data.keywords;

          //console.log(this.suggestedKeywords);

          // To make it search item bold
          this.suggestedKeywords.forEach((element,index) => {
            var mystring = element.keyword.toLowerCase();
            var res = mystring.replace(this.searchString.toLowerCase(),'<span>'+this.searchString+'</span>');
            element.splittedKeyword = res; // creating a new key/value for frontend suggestion loop
          });

        } else {
          this.suggestionSkeletonLoader = false;
        }
      }, err => {
        this.suggestionSkeletonLoader = false;
    });
  }
  


  getSearchResultWithKeywords(keyword){
    console.log(keyword);
  }

  closeNewsletter(){
    this.showNewsletter = false;
    // console.log(this.showNewsletter);
  }

  
  
 

}


