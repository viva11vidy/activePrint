import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import {  Router } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';

import { GlobalsService } from './../../providers/globals-service';
import { UserService } from './../../providers/user-service';
import { AuthService } from './../../providers/auth-service';

@Component({
  selector: 'app-my-address',
  templateUrl: './my-address.component.html',
  styleUrls: ['./my-address.component.scss']
})
export class MyAddressComponent implements OnInit {

  @Input() addressModalType: String;
  @Input() selectedShippingAddress: Object;
  @Input() selectedBillingAddress: Object;
  @Output() addressModalTypeChange = new EventEmitter<String>();
  @Output() selectedShippingAddressChange = new EventEmitter<Object>();
  @Output() selectedBillingAddressChange = new EventEmitter<Object>();

  createAddressDiv:boolean = false;
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
  isBillingAddress:String = "false";

  constructor(private globals: GlobalsService, public userService: UserService, public loader: LoadingBarService, public router: Router, public auth: AuthService, public location: Location) { }

  toggleCreateAddress(){
    this.createAddressDiv = !this.createAddressDiv;
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
      this.createAddressDiv = false;
      // if(this.addressModalType && this.auth.user.shipping_adresses.length == 1) {
      //   this.selectedShippingAddress(this.auth.user.shipping_adresses[0]);
      //   this.selectedBillingAddress(this.auth.user.shipping_adresses[0]);

      // }
    } catch(err) {}
    this.loader.complete();
  }

  async updateAddress(data) {
    this.loader.start();
    try {
      let res = await this.auth.updateAddress(data);
      // console.log(res);
    } catch(err) {}
    this.loader.complete();
  }

  async setDefaultAddress(address_id) {
    this.loader.start();
    try {
      let res = await this.auth.setDefaultAddress({address_id: address_id});
      // console.log(res);
    } catch(err) {}
    this.loader.complete();
  }

  async setBillingAddress(address_id) {
    this.loader.start();
    try {
      let res = await this.auth.setBillingAddress({address_id: address_id});
      // console.log(res);
    } catch(err) {}
    this.loader.complete();
  }

  async removeAddress(address_id) {
    let address = this.auth.user.shipping_adresses.find(el => el._id == address_id);
    
    if(address.is_default) {
      alert('Please select another address as default before delete.');
      return false;
    }
    if(address.is_billing_address) {
      alert('Please select another address as billing before delete.');
      return false;
    }
    if(!confirm("Confirm delete address?")) {
      return false;
    }
    this.loader.start();
    try {
      let res = await this.auth.removeAddress({address_id: address_id});
      // console.log(res);
    } catch(err) {}
    this.loader.complete();
  }

  closePostModal() {
    this.addressModalType = '';
    this.addressModalTypeChange.emit(this.addressModalType);
  }

  selectShippingAddress(address) {
    this.selectedShippingAddress = address;
    this.selectedShippingAddressChange.emit(this.selectedShippingAddress);
    this.closePostModal();
  }

  selectBillingAddress(address) {
    this.selectedBillingAddress = address;
    this.selectedBillingAddressChange.emit(this.selectedBillingAddress);
    this.closePostModal();
  }

  ngOnInit() {
  }

  

}
