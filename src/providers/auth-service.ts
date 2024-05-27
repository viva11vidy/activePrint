import { Injectable, ɵɵsetComponentScope } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStorage  } from '@ngx-pwa/local-storage';
import { Location } from '@angular/common';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { Router } from '@angular/router';
import io from "socket.io-client";
import * as moment from 'moment';


// import { Facebook } from '@ionic-native/facebook';
// import { GooglePlus } from '@ionic-native/google-plus';

import { GlobalsService } from './globals-service';
import { UserService } from './user-service';
import { EventsService } from './events-service';

@Injectable()
export class AuthService {
 
  public isLoggedIn = false;
  public access_token = '';
  public user;
  public cart = [];
  private rejoinTimer;
 
  constructor(private http: HttpClient, private globals: GlobalsService, private storage: LocalStorage , private userService: UserService, private events: EventsService, public router: Router, public location: Location, public loader: LoadingBarService){}
  
  // Login a user
  // Normally make a server request and store
  // e.g. the auth token
  login(userinfo) : Promise<any> {
      let promise = new Promise((resolve, reject) => {
          this.http.post(this.globals.get('appConfig').apiUrl+'customers/login', userinfo)
          .toPromise()
          .then(       
              (data:any) => {
                  if(typeof data == 'object') {
                      // console.log(data.access_token);
                      this.setValidUser(data);
                      this.access_token = data.access_token;
                      localStorage.setItem('access_token', data.access_token);
                      
                      // console.log(localStorage);
                      // console.log(localStorage.getItem('access_token'));
                  }
                  resolve(true);
              }, 
              (err:any) => {
                  // console.log(err);
                  this.globals.showErrorAlert(this.userService.getError(err));                        
                  reject(this.userService.getError(err));
                  
              }
          );
      });
      return promise;
  }
 

  getOTP(userInfo) : Promise<any> {
      let promise = new Promise((resolve, reject) => {
          this.http.post(this.globals.get('appConfig').apiUrl+'customers/request-otp', userInfo)
          .toPromise()
          .then(       
              (data:any) => {
                  if(typeof data == 'object') {
                      resolve(data);
                      // this.setValidUser(data);
                      // this.access_token = data.access_token;
                      // localStorage.setItem('access_token', data.access_token);
                  }
                  // resolve(true);
              }, 
              (err:any) => {
                  // var failuretoast = this.globals.createToast(this.userService.getError(err));
                  // this.globals.showToast(failuretoast);
                  this.globals.showErrorAlert(this.userService.getError(err));                        
                  reject(this.userService.getError(err));
              }
          );
      });
      return promise;
  }
 
  signup(userInfo) : Promise<any> {
      let promise = new Promise((resolve, reject) => {
          this.http.post(this.globals.get('appConfig').apiUrl+'customers/sign-up', userInfo)
          .toPromise()
          .then(       
              (data:any) => {
                  if(typeof data == 'object') {
                      resolve(data);
                      this.access_token = data.access_token;
                  }
                  // resolve(true);
              }, 
              (err:any) => {
                  // var failuretoast = this.globals.createToast(this.userService.getError(err));
                  // this.globals.showToast(failuretoast);
                  this.globals.showErrorAlert(this.userService.getError(err));                        
                  reject(this.userService.getError(err));
              }
          );
      });
      return promise;
  }

  verifyAccountOTP(userInfo) : Promise<any> {
      let promise = new Promise((resolve, reject) => {
          this.http.post(this.globals.get('appConfig').apiUrl+'customers/verify-account-using-otp', userInfo)
          .toPromise()
          .then(       
              (user:any) => {
                  if(typeof user == 'object') {
                    let data = {
                      user: user,
                      cart: this.cart
                    };
                    this.setValidUser(data);
                    console.log(data, this.access_token);
                    localStorage.setItem('access_token', this.access_token);
                    resolve(data);
                      
                      // this.access_token = data.access_token;
                      // localStorage.setItem('access_token', data.access_token);
                  }
                  // resolve(true);
              }, 
              (err:any) => {
                  // var failuretoast = this.globals.createToast(this.userService.getError(err));
                  // this.globals.showToast(failuretoast);
                  this.globals.showErrorAlert(this.userService.getError(err));                        
                  reject(this.userService.getError(err));
              }
          );
      });
      return promise;
  }

  socialLogin(socialCustomer) : Promise<any> {
      let promise = new Promise((resolve, reject) => {
          this.http.post(this.globals.get('appConfig').apiUrl+'auth/socialLogin', socialCustomer)
          .toPromise()
          .then(       
              (data:any) => {
                  if(typeof data == 'object') {
                      this.setValidUser(data);
                      this.access_token = data.access_token;
                      localStorage.setItem('access_token', data.access_token);
                  }
                  resolve(true);
              }, 
              (err:any) => {
                  // var failuretoast = this.globals.createToast(this.userService.getError(err));
                  // this.globals.showToast(failuretoast);
                  this.globals.showErrorAlert(this.userService.getError(err));                        
                  reject(this.userService.getError(err));
              }
          );
      });
      return promise;
  }

  forgotPwdRequest(request) : Promise<any> {
      let promise = new Promise((resolve, reject) => {
          this.http.post(this.globals.get('appConfig').apiUrl+'customers/request-otp', request)
          .toPromise()
          .then(       
              (data:any) => {
                  if(typeof data == 'object') {
                      this.globals.showSuccessAlert('OTP has been sent to you');  
                      //  var successtoast = this.globals.createToast('OTP has been sent to your registered email.');
                      //  this.globals.showToast(successtoast);
                      resolve(data); 
                  } else {
                      resolve(false); 
                  }
              }, 
              (err:any) => {
                  console.log('as');
                  //  var failuretoast = this.globals.createToast(this.userService.getError(err));
                  // this.globals.showToast(failuretoast);
                  this.globals.showErrorAlert(this.userService.getError(err));                        
                  reject(this.userService.getError(err));
              }
          );
      });
      return promise;
  }

  forgotPwdReset(reset) : Promise<any> {
      let promise = new Promise((resolve, reject) => {
          this.http.post(this.globals.get('appConfig').apiUrl+'customers/change-password-using-otp', reset)
          .toPromise()
          .then(       
              (data:any) => {
                  if(typeof data == 'object') {
                      this.globals.showSuccessAlert('Password has been updated successfully. Please login with new password');  
                    //  var successtoast = this.globals.createToast('Password has been updated successfully. Please login with new password');
                    //  this.globals.showToast(successtoast);
                      resolve(data); 
                  } else {
                      resolve(false); 
                  }
              }, 
              (err:any) => {
                  console.log(err);
                  // var failuretoast = this.globals.createToast(this.userService.getError(err));
                //  this.globals.showToast(failuretoast);
                this.globals.showErrorAlert(this.userService.getError(err));                        
                reject(this.userService.getError(err));
              }
          );
      });
      return promise;
  }

  validateToken() : Promise<any>{
    let promise = new Promise(async (resolve, reject) => {

      this.http.post(this.globals.get('appConfig').apiUrl+'customers/validate-token', {})
      .toPromise()
      .then(       
        (data:any) => {
            if(typeof data == 'object') {
              //console.log(data);
              this.setValidUser(data);
              resolve(data);
              this.globals.validateTokenCallComplete = true;
              this.events.emit('validateTokenCallComplete', true);
            } else {
              this.isLoggedIn = false;
              this.user = {};
              localStorage.setItem('user', JSON.stringify({}));
              localStorage.setItem('cart', JSON.stringify({}));
              resolve(false);
              this.globals.validateTokenCallComplete = true;
              this.events.emit('validateTokenCallComplete', true);
            }
            
        }, 
        (err:any) => {
          this.isLoggedIn = false;
          this.user = {};
          localStorage.setItem('user', JSON.stringify({}));
          localStorage.setItem('cart', JSON.stringify({}));
          reject(this.userService.getError(err));
          this.globals.validateTokenCallComplete = true;
          this.events.emit('validateTokenCallComplete', true);
        }
      );
    });
    return promise;
  }


  setValidUser(data, save = true) {
      this.isLoggedIn = true;
      this.user = data.user;
      this.cart = data.cart;
      this.parseCartData();
      if(save) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('cart', JSON.stringify(data.cart));
      }
      this.initializeChat();
  }

  unsetUser() {
      this.isLoggedIn = false;
      this.access_token = '';
      this.user = {};
      this.cart = [];
      localStorage.removeItem('access_token');
      localStorage.removeItem('user'); 
      localStorage.removeItem('cart'); 
      this.globals.socket = null;
      this.globals.userList = [];
      this.globals.unreadChats = 0;
      this.globals.onlineUsers = [];
      this.globals.newMessage = {};
      this.globals.readingChats = false;
      this.globals.readingChatsOf = '';
  }

  // Logout a user, destroy token and remove
  // every information related to a user
  logout(){
      this.loader.start();
      setTimeout(() =>{
          this.loader.complete();
          this.unsetUser();
          // this.location.replaceState('/');
          // window.location.reload();
          this.router.navigate(['/home']);
      },2000)
      
    }


    
  getLocalToken(): String {
      //console.log(this.access_token);
      return this.access_token ;

  }
  getToken(): String {
      
      this.access_token = localStorage.getItem('access_token');
      return this.access_token ;
  }

  getStorageToken(): Promise<any> {
      let promise = new Promise((resolve, reject) => {
          this.storage.getItem('access_token').subscribe(function(token){
              if(typeof token != typeof undefined) {
                  this.access_token = token;
                  resolve(this.access_token);
              } else {
                  resolve(false);
              }
          }.bind(this), function(err){
              reject(this.userService.getError(err));
          }.bind(this));
      });
      return promise;
      
  }

  // Returns whether the user is currently authenticated
  // Could check if current token is still valid
  authenticated() : boolean {
      return this.isLoggedIn;
  }
    
  get(key) {
    return this[key];
  }
  set(key, value) {
    return this[key] = value;
  }

  


  parseCartData = () => {
      let promise = new Promise((resolve, reject) => {
        this.http.get(this.globals.get('appConfig').apiUrl+'orders/my-cart')
        .toPromise()
        .then(       
          (data:any) => {
            if(typeof data == 'object') {



              if(data){

                let total_delivery_charge = 0;
                let total_custom_design_charge = 0;
        
                data.forEach(cartElement => {
        
                  cartElement.final_price = cartElement.final_price - cartElement.delivery_charge - cartElement.custom_design_charge;
                  cartElement.unitPrice = cartElement.final_price / cartElement.variation_price_selcted.qty;
        
                  total_delivery_charge += cartElement.delivery_charge;
                  total_custom_design_charge += cartElement.custom_design_charge;
            
                  cartElement.variation_selcted.variation.forEach(variationElement => {
                    variationElement.group = variationElement.group ? variationElement.group : cartElement.product.info.properties.find(el => el._id == variationElement.grpid).property.group;
                    variationElement.property = variationElement.property ? variationElement.property : cartElement.product.info.properties.find(el => el._id == variationElement.grpid).property.options.find(el => el._id == variationElement.propid).name;
                    });
                });
        
                if(data.length){
                  data[0].cart_master.total_delivery_charge = total_delivery_charge;
                  data[0].cart_master.total_custom_design_charge = total_custom_design_charge;
                }

                this.cart = data;
              }



                resolve(data);
            } else {
                resolve(false);
            }
          }, 
          (err:any) => {
            reject(this.userService.getError(err));
          }
        );
      });
      return promise;
    }



    
  

  addToCart(data) : Promise<any>{
      let promise = new Promise((resolve, reject) => {
        this.http.post(this.globals.get('appConfig').apiUrl+'orders/add-to-cart', data)
        .toPromise()
        .then(       
          (data:any) => {
            if(data != null) {
                this.cart.push(data);
                
                this.cart[0].cart_master.total_cart_final_value += data.final_price;
                this.cart[0].cart_master.total_cart_price += (data.final_price - data.delivery_charge - data.custom_design_charge);
                // this.cart[0].cart_master.total_cart_final_value = data.cart_master.total_cart_final_value;
                // this.cart[0].cart_master.total_cart_price = data.cart_master.total_cart_price;
                // this.cart[0].cart_master.total_cart_disc = data.cart_master.total_cart_disc;
                this.parseCartData();
                localStorage.setItem('cart', JSON.stringify(this.cart));
              resolve(data);
            } else {
              resolve(false);
            }
          }, 
          (err:any) => {
            this.globals.showErrorAlert(this.userService.getError(err));
            // this.globals.showToast(failuretoast);
            reject(this.userService.getError(err));
          }
        )
    });
    return promise;
  }

  

  updateCart(data) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
        this.http.post(this.globals.get('appConfig').apiUrl+'orders/adjust-cart-item-qty', data)
        .toPromise()
        .then(       
          (res:any) => {
            if(res != null) {
                let updateItemIndex = this.cart.findIndex(el => el._id == data.cartid);
                // console.log(data.cartid, removeItemIndex);
                if(updateItemIndex != -1) {


                    // let old_final_price = this.cart[updateItemIndex].final_price + res.delivery_charge + res.custom_design_charge;
                    // let new_base_price = res.final_price - res.delivery_charge - res.custom_design_charge;
                    // let new_total_cart_final_value = this.cart[0].cart_master.total_cart_final_value - old_final_price + res.final_price;
                    // let new_total_cart_price = this.cart[0].cart_master.total_cart_price - this.cart[updateItemIndex].final_price + new_base_price;

                    // this.cart[updateItemIndex] = res;

                    // this.cart[0].cart_master.total_cart_final_value = new_total_cart_final_value;
                    // this.cart[0].cart_master.total_cart_price = new_total_cart_price;



                    // this.cart[0].cart_master.total_cart_final_value = res.cart_master.total_cart_final_value;
                    // this.cart[0].cart_master.total_cart_price = res.cart_master.total_cart_price;
                    // this.cart[0].cart_master.total_cart_disc = res.cart_master.total_cart_disc;


                    this.parseCartData();
                    
                    localStorage.setItem('cart', JSON.stringify(this.cart));
                }
              resolve(res);
            } else {
              resolve(false);
            }
          }, 
          (err:any) => {
            this.globals.showErrorAlert(this.userService.getError(err));
            // this.globals.showToast(failuretoast);
            reject(this.userService.getError(err));
          }
        )
    });
    return promise;
  }

  removeItemFromCart(data) : Promise<any>{
    
    let promise = new Promise((resolve, reject) => {
        this.http.post(this.globals.get('appConfig').apiUrl+'orders/remove-cart-item', data)
        .toPromise()
        .then(       
          (res:any) => {
            if(res != null) {
                let removeItemIndex = this.cart.findIndex(el => el._id == data.cartid);
                // console.log(data.cartid, removeItemIndex);
                if(removeItemIndex != -1) {
                    // let new_total_cart_final_value = this.cart[0].cart_master.total_cart_final_value - this.cart[removeItemIndex].final_price;
                    // let new_total_cart_price = this.cart[0].cart_master.total_cart_price - (this.cart[removeItemIndex].final_price - this.cart[removeItemIndex].delivery_charge - this.cart[removeItemIndex].custom_design_charge);

                    this.cart.splice(removeItemIndex, 1);

                    if(this.cart.length){


                      // this.cart[0].cart_master.total_cart_final_value = new_total_cart_final_value;
                      // this.cart[0].cart_master.total_cart_price = new_total_cart_price;


                      // this.cart[0].cart_master.total_cart_final_value = res.cart_master.total_cart_final_value;
                      // this.cart[0].cart_master.total_cart_price = res.cart_master.total_cart_price;
                      // this.cart[0].cart_master.total_cart_disc = res.cart_master.total_cart_disc;
                      this.parseCartData();
                    }
                    
                    localStorage.setItem('cart', JSON.stringify(this.cart));
                }
              resolve(res);
            } else {
              resolve(false);
            }
          }, 
          (err:any) => {
            this.globals.showErrorAlert(this.userService.getError(err));
            // this.globals.showToast(failuretoast);
            reject(this.userService.getError(err));
          }
        )
    });
    return promise;
  }

  uploadFile = (params) => {
    let promise = new Promise((resolve, reject) => {
      this.http.post(this.globals.get('appConfig').apiUrl+'files/upload-file', params)
      .toPromise()
      .then(       
        (data:any) => {
          if(typeof data == 'object') {
              resolve(data);
          } else {
              resolve(false);
          }
        }, 
        (err:any) => {
          reject(this.userService.getError(err));
        }
      );
    });
    return promise;
  }

  

  uploadImage = (params) => {
    let promise = new Promise((resolve, reject) => {
      this.http.post(this.globals.get('appConfig').apiUrl+'files/upload-image', params)
      .toPromise()
      .then(       
        (data:any) => {
          if(typeof data == 'object') {
              resolve(data);
          } else {
              resolve(false);
          }
        }, 
        (err:any) => {
          reject(this.userService.getError(err));
        }
      );
    });
    return promise;
  }


  addNewAddress(data) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
      this.http.post(this.globals.get('appConfig').apiUrl+'customers/add-new-shipping-address', data)
      .toPromise()
      .then(       
        (data:any) => {
          if(data != null) {
            this.user = data;
            localStorage.setItem('user', JSON.stringify(this.user));
            resolve(data);
          } else {
            resolve(false);
          }
        }, 
        (err:any) => {
          this.globals.showErrorAlert(this.userService.getError(err));
          // this.globals.showToast(failuretoast);
          reject(this.userService.getError(err));
        }
      )
    });
    return promise;
  }

  updateAddress(data) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
      this.http.post(this.globals.get('appConfig').apiUrl+'customers/update-shipping-address', data)
      .toPromise()
      .then(       
        (data:any) => {
          if(data != null) {
            this.user = data;
            localStorage.setItem('user', JSON.stringify(this.user));
            resolve(data);
          } else {
            resolve(false);
          }
        }, 
        (err:any) => {
          this.globals.showErrorAlert(this.userService.getError(err));
          // this.globals.showToast(failuretoast);
          reject(this.userService.getError(err));
        }
      )
    });
    return promise;
  }

  setDefaultAddress(data) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
      this.http.post(this.globals.get('appConfig').apiUrl+'customers/set-default-shipping-address', data)
      .toPromise()
      .then(       
        (data:any) => {
          if(data != null) {
            this.user = data;
            localStorage.setItem('user', JSON.stringify(this.user));
            resolve(data);
          } else {
            resolve(false);
          }
        }, 
        (err:any) => {
          this.globals.showErrorAlert(this.userService.getError(err));
          // this.globals.showToast(failuretoast);
          reject(this.userService.getError(err));
        }
      )
    });
    return promise;
  }

  setBillingAddress(data) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
      this.http.post(this.globals.get('appConfig').apiUrl+'customers/set-billing-address', data)
      .toPromise()
      .then(       
        (data:any) => {
          if(data != null) {
            this.user = data;
            localStorage.setItem('user', JSON.stringify(this.user));
            resolve(data);
          } else {
            resolve(false);
          }
        }, 
        (err:any) => {
          this.globals.showErrorAlert(this.userService.getError(err));
          // this.globals.showToast(failuretoast);
          reject(this.userService.getError(err));
        }
      )
    });
    return promise;
  }


  removeAddress(data) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
      this.http.post(this.globals.get('appConfig').apiUrl+'customers/remove-shipping-address', data)
      .toPromise()
      .then(       
        (data:any) => {
          if(data != null) {
            this.user = data;
            localStorage.setItem('user', JSON.stringify(this.user));
            resolve(data);
          } else {
            resolve(false);
          }
        }, 
        (err:any) => {
          this.globals.showErrorAlert(this.userService.getError(err));
          // this.globals.showToast(failuretoast);
          reject(this.userService.getError(err));
        }
      )
    });
    return promise;
  }

  initializeChat() {

    if(this.globals.socket) return false;

    this.globals.socket = io.connect(this.globals.get('appConfig').chatUrl, {
        query: {token: this.getLocalToken()},
        // transports: ['websocket', 'polling'],
        // secure: true,
    });


    this.globals.socket.emit('join');
    this.rejoinTimer = setInterval(() => {
        this.globals.socket.emit('rejoin');
    }, 3000);

    this.globals.socket.on('joined', (me) => {
        // console.log('joined', me.onlineUsers);
        this.globals.onlineUsers = me.onlineUsers;
        this.globals.socket.emit('usersGetting');
    });

    this.globals.socket.on('rejoined', (me) => {
        //console.log('rejoined', me.onlineUsers);
        this.globals.onlineUsers = me.onlineUsers;
        this.globals.userList.forEach((element, index) => {
            if(this.globals.isOnline(this.globals.userList[index]._id[0]._id)) {
                var onlineUserInfo = this.globals.getOnlineUserInfo(this.globals.userList[index]._id[0]._id);
                this.globals.userList[index]._id[0].name = onlineUserInfo.name;
                this.globals.userList[index]._id[0].thumb_profile_picture = onlineUserInfo.profile_picture;
            }
        });
    });

    this.globals.socket.on('msg', function(msg){
        console.log('msg', msg);
    }.bind(this));

    this.globals.socket.on('userList', (userList) => {
        // console.log('userList', userList);
        if(userList) {
            this.globals.unreadChats = 0;
            this.globals.userList = this.prepareUserListSearchFriendly(userList);
            for(var i in userList) {
              userList[i].msgTime = moment(userList[i].created).fromNow();
              if(userList[i].chatCount) {
                  this.globals.unreadChats += parseInt(userList[i].chatCount);
              }
            }
        }
    });

    this.globals.socket.on('msgSent', (messageList) => {
      if(messageList) {
          this.globals.socket.emit('usersGetting');

      }
    });

    this.globals.socket.on('newMsgReceived', (data) => {
        //console.log('data', data);
        if(this.globals.readingChats && this.globals.readingChatsOf == data.from._id) {
            return false;
        }
        // this.globals.setNewMessge(data);
    });

}

  prepareUserListSearchFriendly(users) {
    
    users.forEach((element, i) => {

      users[i]._id = users[i].user1[0]._id == this.user._id ? [...users[i].user2] : [...users[i].user1];
      users[i].searchField = `${ users[i]['_id'][0].name }`;

    });
    //console.log(userList);
    return users;

  }
    
}