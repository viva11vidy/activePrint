import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {  Router, ActivatedRoute } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';

import { GlobalsService } from './../../providers/globals-service';
import { UserService } from './../../providers/user-service';
import { AuthService } from './../../providers/auth-service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  user;
  password = {
    current : '',
    new : '',
    confirm : ''
  };

  contactUsEmail;
  contactUsTitle;
  contactUsDescription;
  cancelReasonText;

  public active = 'aboutProfileDiv';
  aboutProfileDiv:boolean = true;
  myOrdersDiv:boolean = false;
  wishlistDiv:boolean = false;
  addressDiv:boolean = false;
  orderDetailsDiv:boolean = false;
  chatDiv:boolean = false;
  customerCareDiv:boolean = false;

  page = 1
  recordPerPage = 10000;
  noMorePage = false;
  showInfiniteScrollLoader:boolean = false;

  wishlistItems: any = null;
  orders: any = null;
  
  selectedOrderIndex = -1;
  selectedOrderItemIndex:Number = -1;
  
  myReviewsDiv:boolean = false;
  editProfileDiv:boolean = false;
  changePasswordDiv:boolean = false;
  dob;

  orderSkeleton:boolean = true;
  wishlistSkeleton:boolean = true;
  today = new Date();
  
  statusStep;
  alertConfirm:boolean = false;
  checkoutUrl = this.globals.get('appConfig').apiUrl+'payments/checkout/';

  onlymobile = false;

  constructor(public globals: GlobalsService, public userService: UserService, public loader: LoadingBarService, public router: Router, public auth: AuthService, public location: Location, public activatedRoute: ActivatedRoute) {

    if(!this.auth.authenticated()){
      this.location.replaceState('/');
      this.router.navigate(['/home']);
    } else {

      this.router.routeReuseStrategy.shouldReuseRoute = () => false;

      this.activatedRoute.params.subscribe(params => {
        let tabToOpen = params['url'];
        switch(tabToOpen) {
          case 'info':
            this.aboutProfile();
            this.getUserInfo();
            break;
          case 'orders':
            this.showMyOrders();
            this.getMyOrders(params['orderID'] ? params['orderID'] : -1);
            break;
          case 'support-chat':
            this.showChat();
            this.getChat();
            break;
          case 'wishlist':
            this.showWishlist();
            this.getMyWishlist();
            break;
          case 'manage-addresses':
            this.showAddress();
            this.getUserInfo();
            break;
          case 'change-password':
            this.showChangePassword();
            break;
          case 'customer-care':
            this.showCustomerCare();
            break;
          case 'reviews':
            this.showMyReviews();

            break;
          default:
          this.aboutProfile();
        }
      });

      this.user = JSON.parse(JSON.stringify(this.auth.get('user')));
      if(this.user.dob){
        this.user.dob = (this.user.dob).split("T")[0]; //getting value from api with iso string
        this.dob = this.user.dob; //getting value from api then convert and set to ng model
      }
      this.contactUsEmail = this.user.email ? this.user.email : '';
      
    }
    
    
  }

  toggleOnlyMobileSection(){
    this.onlymobile = !this.onlymobile;
  }


  hideAllDive(){
    this.editProfileDiv = false;
    this.aboutProfileDiv = false;
    this.changePasswordDiv = false;
    this.myOrdersDiv = false;
    this.chatDiv = false;
    this.myReviewsDiv = false;
    this.addressDiv = false;
    this.wishlistDiv = false;
    this.orderDetailsDiv = false;
    this.customerCareDiv = false;
  }

  editProfile(){
    this.active = 'Edit Profile';
    this.hideAllDive();
    this.editProfileDiv = true;
  }

  aboutProfile(){
    this.active = 'aboutProfileDiv';
    this.hideAllDive();
    this.aboutProfileDiv = true;
  }

  showMyOrders(){
    this.active = 'My Orders';
    this.hideAllDive();
    this.myOrdersDiv = true;
  }

  showWishlist(){
    this.active = 'Wishlist';
    this.hideAllDive();
    this.wishlistDiv = true;
  }

  showAddress(){
    this.active = 'Addresses';
    this.hideAllDive();
    this.addressDiv = true;
  }

  showMyReviews(){
    this.active = 'My Reviews';
    this.hideAllDive();
    this.myReviewsDiv = true;
  }

  showChangePassword(){
    this.active = 'Change Password';
    this.hideAllDive();
    this.changePasswordDiv = true;
  }

  showCustomerCare(){
    this.active = 'Customer Care';
    this.hideAllDive();
    this.customerCareDiv = true;
  }

  showChat(){
    this.active = 'Support Chat';
    this.hideAllDive();
    this.chatDiv = true;
  }



  goToOrderDetail(selectedOrderIndex){
    this.active = 'My Orders';
    this.hideAllDive();
    this.orderDetailsDiv = true;
    this.selectedOrderIndex = selectedOrderIndex;
  }

  async getUserInfo(){
    this.loader.start();
    try {
      await this.auth.validateToken();
      this.auth.user = JSON.parse(JSON.stringify(this.auth.get('user')));
      if(this.user.dob){
        this.user.dob = (this.user.dob).split("T")[0]; //getting value from api with iso string
        this.dob = this.user.dob; //getting value from api then convert and set to ng model
      }
    } catch(err) {}
    this.loader.complete();
  }

  async getMyWishlist(){
    this.wishlistSkeleton = true;
    this.loader.start();
    try {
      let data = await this.userService.wishlistListing({page: this.page, perpage: this.recordPerPage});
      this.wishlistItems = data;
      this.wishlistItems.forEach(element => {
        element.product[0].addedToWishlist = true;
      });
      this.wishlistSkeleton = false;
    } catch(err) {}
    this.loader.complete();
  }

  async getMyOrders(paramsOrderID){
    this.orderSkeleton = true;
    this.loader.start();
    try {
      let data = await this.userService.orderListing({page: this.page, perpage: this.recordPerPage});
      this.orders = data;
      this.orderSkeleton = false;
      if(paramsOrderID) {
        let paramsOrderIndex = this.orders.findIndex(order => order._id == paramsOrderID);
        if(paramsOrderIndex != -1) {
          this.goToOrderDetail(paramsOrderIndex);
        }
      }
    } catch(err) {}
    this.loader.complete();
  }

  async getChat(){
    console.log('chat called');
  }

  goToProductDetailsPage(productID,productSlug){
    this.router.navigate(['/product/'+productSlug+'/'+productID]); 
  }

  addToWishlist(productid, index){
    let userParams = {
      eid : productid,
      type: 'Product'
    };
    this.loader.start();
    this.userService.wishlist(userParams).then(function(data){
      if(!data) {
        this.wishlistItems.splice(index, 1);        
      }
      this.loader.complete();
    }.bind(this), function(err) {
      this.loader.complete();
    }.bind(this));
  }
  

  

  updatePassword(){
    var data = {
      password: this.password.current,
      new_password: this.password.new
    };
    this.loader.start();
    this.userService.passwordUpdate(data).then(function(response){
      if(response){
        this.password = {
          current : '',
          new : '',
          confirm : ''
        };
        this.loader.complete();
      }
    }.bind(this), function(error) {
      this.loader.complete();
    }.bind(this));
  }

  changeProfilePicture(event) {
		if(!event.target.files[0] || event.target.files[0].length == 0) {
      this.globals.showErrorAlert('You must select an image');
			return;
		}
		var mimeType = event.target.files;
    const formData = new FormData();
    for (const file of mimeType) {
      formData.append('image', file);
    }
    this.loader.start();
    this.userService.uploadProfilePicture(formData).then(data => {
      if(data){
        this.auth.validateToken().then(data2 => {
          if(data2){
            this.loader.complete();
          } else {
            this.globals.showErrorAlert('Some error occurred.');
            this.loader.complete();
          }
        });
      }
    }, err => {
      this.loader.complete();
    });
  }


  updateProfile(){
    var a = this.dob;
    var b = new Date(a);
    var c = b.toISOString();
    // console.log(c);

    var data = {
      fname: (<any>this).user.fname,
      lname: (<any>this).user.lname,
      gender: (<any>this).user.gender,
      dob:c,
    };
    this.loader.start();
    this.userService.profileUpdate(data).then(function(response){
      if(response){
        this.loader.complete();
        // this.auth.validateToken();
        // this.getAge();
        window.location.replace("/my-account");
      }
    }.bind(this), function(response){
      this.loader.complete();
    }.bind(this));
  }

  async sendMessage(){
    var data = {
      fname: this.auth.user.fname,
      lname: this.auth.user.lname,
      email: this.contactUsEmail.toLowerCase(),
      title: this.contactUsTitle,
      message: this.contactUsDescription,
    };
    this.loader.start();
    try {
      let response = await this.userService.contactHelp(data);
      if(response){
        this.contactUsEmail = this.auth.user.email ? this.auth.user.email : '';
        this.contactUsTitle = '';
        this.contactUsDescription = '';
        this.globals.showSuccessAlert('Thank you for contacting with us. We will get back to you soon.');
      }
    } catch(err) {
      console.log(err);
    }
    this.loader.complete();
  }

  async updateOrder() {
    if(this.selectedOrderIndex == -1) return; 
    this.loader.start();
    try {
      let data:any = {
        oid: this.orders[this.selectedOrderIndex]._id,
        status: this.orders[this.selectedOrderIndex].order_status == 'Delivered' ? 'Return' : 'Cancel',
        message: this.cancelReasonText,
      }
      let order = await this.userService.updateOrder(data);
      this.closeAlert();
      this.orders[this.selectedOrderIndex].order_status = order.order_status;
      this.orders[this.selectedOrderIndex].order_status_logs = order.order_status_logs;
    } catch(err) { }
    this.loader.complete();
    
  }

 
  openCancelPopup(){
    this.alertConfirm = true;
  }
  closeAlert(){
    this.alertConfirm = false;
    this.cancelReasonText = '';
  }

  goToPaymentPage(orderID){
    let redirectUrl = location.origin+'/orders/'+ orderID;
    let paymentUrl = this.checkoutUrl + orderID  + '?succredir=' + encodeURI(redirectUrl) + '&failedredir=' + encodeURI(redirectUrl);
    location.href = paymentUrl;
  }


  ngOnInit() {
    
  }

 

  

 


}
