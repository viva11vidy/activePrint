import { Component, OnInit } from '@angular/core';
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
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  animations: [
    trigger(
      'leaveAnimation', [
        transition(':leave', [
          style({
            transform: 'none',
          }),
          animate('300ms', style({transform: 'translate3d(-100%, 0, 0)'}))
        ])
      ]
    ),

    
  ],
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  paymentMode = '';
  shippingAddress;
  billingAddress;
  showBillingAddress:boolean = false;
  addressSelectionModal:String = '';

  fullName:String = "";
  address1:String = "";
  address2:String = "";
  city:String = "";
  state:String = "";
  zipcode:String = "";
  country:String = "India";
  phoneNumber1:String = "";
  phoneNumber2:String = "";
  isHomeAddress:String = "true";

  b_fullName:String = "";
  b_address1:String = "";
  b_address2:String = "";
  b_city:String = "";
  b_state:String = "";
  b_zipcode:String = "";
  b_country:String = "India";
  b_phoneNumber1:String = "";
  b_phoneNumber2:String = "";
  b_isHomeAddress:String = "true";

  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  userEmail:String = "";

  checkoutStep = 1;
  checkoutUrl = this.globals.get('appConfig').apiUrl+'payments/checkout/';


  constructor(public globals: GlobalsService, public userService: UserService, public loader: LoadingBarService, public router: Router, public auth: AuthService, public location: Location, private events: EventsService) {

    // if(!this.auth.cart.length){
    //   this.location.replaceState('/');
    //   this.router.navigate(['/cart']);
    // }

    if(this.auth.user.shipping_adresses) {
      this.shippingAddress = this.auth.user.shipping_adresses.find(el => el.is_default);
      this.billingAddress = this.auth.user.shipping_adresses.find(el => el.is_billing_address);
    }

    // this.events.listen('authUser', data => {
    //   console.log('fired');
    //   this.auth.user = data;
    //   if(this.auth.user.shipping_adresses) {
    //     this.shippingAddress = this.auth.user.shipping_adresses.find(el => el.is_default);
    //     this.billingAddress = this.auth.user.shipping_adresses.find(el => el.is_billing_address);
    //   }
    // });
    
    // this.events.emit('authUser', this.auth.user);
    
  }

  ngOnInit() {}

  changeCheckOutStep(step){
    this.checkoutStep = step;
  };

  setPaymentMode(type){
    this.paymentMode = type;
  }

  goToProfile(url){
    this.router.navigate(['/my-account/'+url]); 
  }

  async placeOrder(){
    this.loader.start();
    try {
      let data:any = {
        payment_mode: this.paymentMode,
        billing_address_id: this.billingAddress._id,
        shipping_address_id: this.shippingAddress._id,
      }
      if(this.paymentMode == 'Online') {
        data.payment_success_redirect_url = location.origin+'/success/';
      }
      let order = await this.userService.createOrder(data);
      await this.auth.validateToken(); 
      if(order.payment_mode == 'Online') {
        data.payment_success_redirect_url = data.payment_success_redirect_url + order._id;
        let paymentUrl = this.checkoutUrl + order._id + '?succredir=' + encodeURI(data.payment_success_redirect_url) + '&failedredir=' + encodeURI(data.payment_success_redirect_url);
        location.href = paymentUrl;
      } else {
        this.router.navigate(['/success/'+order._id]); 
      }
    } catch(err) { }
    this.loader.complete();
    
  }


  async addNewAddress() {
    let data = {
      full_name: this.fullName,
      address1: this.address1,
      address2: this.address2,
      city: this.city,
      state: this.state,
      zipcode: this.zipcode,
      country: this.country,
      phone_number_1: this.phoneNumber1,
      phone_number_2: this.phoneNumber2,
      is_home_address: this.isHomeAddress,
    };

    let b_data = {
      full_name: this.b_fullName,
      address1: this.b_address1,
      address2: this.b_address2,
      city: this.b_city,
      state: this.b_state,
      zipcode: this.b_zipcode,
      country: this.b_country,
      phone_number_1: this.b_phoneNumber1,
      phone_number_2: this.b_phoneNumber2,
      is_home_address: this.b_isHomeAddress,
    };

    this.loader.start();
    try {
      let res = await this.auth.addNewAddress(data);
      // console.log(res);
      this.fullName = "";
      this.address1 = "";
      this.address2 = "";
      this.city = "";
      this.state = "";
      this.zipcode = "";
      this.phoneNumber1 = "";
      this.phoneNumber2 = "";
      this.isHomeAddress = "true";

      if(this.showBillingAddress) {
        let res_2 = await this.auth.addNewAddress(b_data);
        console.log(res_2);
        this.b_fullName = "";
        this.b_address1 = "";
        this.b_address2 = "";
        this.b_city = "";
        this.b_state = "";
        this.b_zipcode = "";
        this.b_phoneNumber1 = "";
        this.b_phoneNumber2 = "";
        this.b_isHomeAddress = "true";

        if(res_2.shipping_adresses.length > 1) {
          let res_3 = await this.auth.setBillingAddress({address_id: res_2.shipping_adresses[res_2.shipping_adresses.length - 1]._id});
        }
      }
      
      if(this.auth.user.shipping_adresses) {
        this.shippingAddress = this.auth.user.shipping_adresses.find(el => el.is_default);
        this.billingAddress = this.auth.user.shipping_adresses.find(el => el.is_billing_address);
      }
    } catch(err) {}
    this.loader.complete();
  }


}
