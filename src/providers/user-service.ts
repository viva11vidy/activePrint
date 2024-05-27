import { Injectable, Component } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
//import { ToastController } from 'ionic-angular';
import { GlobalsService } from './globals-service';



@Injectable()
export class UserService {
 
  


  constructor(private http: HttpClient,  private globals: GlobalsService){

  }
        
    get(key) {
        return this[key];
    }
        
    set(key, value) {
        return this[key] = value;
    }

    
    categoryListing(filter) : Promise<any>{
      var Uri = this.globals.get('appConfig').apiUrl+'listing/categories?dummy=true';
      if(typeof filter == 'object') {
        if(typeof filter.page != typeof undefined) {
          Uri += "&page="+filter.page;
        }
        if(typeof filter.perpage != typeof undefined) {
          Uri += "&perpage="+filter.perpage;
        }
        if(filter.slug) {
          Uri += '&slug=' + filter.slug;
        }
        if(filter.q) {
          Uri += '&q=' + filter.q;
        } 
        if(filter.id) {
          Uri += '&id=' + filter.id;
        } 
      }
      let promise = new Promise((resolve, reject) => {
          this.http.get(Uri)
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
                  reject(this.getError(err));
              }
          )
      });
      return promise;
  }

  productListing(filter) : Promise<any>{
    var Uri = this.globals.get('appConfig').apiUrl+'listing/products?dummy=true';
    if(typeof filter == 'object') {
      if(typeof filter.page != typeof undefined) {
        Uri += "&page="+filter.page;
      }
      if(typeof filter.perpage != typeof undefined) {
        Uri += "&perpage="+filter.perpage;
      }
      if(filter.slug) {
        Uri += '&slug=' + filter.slug;
      }
      if(filter.q) {
        Uri += '&q=' + filter.q;
      } 
      if(filter.id) {
        Uri += '&id=' + filter.id;
      } 
      if(filter.cslug) {
        Uri += '&cslug=' + filter.cslug;
      } 
      if(filter.cid) {
        Uri += '&cid=' + filter.cid;
      } 
      if(filter.sort) {
        Uri += '&sort=' + filter.sort;
      }
      if(filter.offer) {
        Uri += '&offer=' + filter.offer;
      }
    }
    let promise = new Promise((resolve, reject) => {
        this.http.get(Uri)
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
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }

  productSuggestionListing(filter) : Promise<any>{
    var Uri = this.globals.get('appConfig').apiUrl+'listing/suggestions-products/?dummy=true';
    if(typeof filter == 'object') {
      if(typeof filter.page != typeof undefined) {
        Uri += "&page="+filter.page;
      }
      if(typeof filter.perpage != typeof undefined) {
        Uri += "&perpage="+filter.perpage;
      }
      if(filter.q) {
        Uri += '&q=' + filter.q;
      } 
    }
    let promise = new Promise((resolve, reject) => {
      this.http.get(Uri)
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
          reject(this.getError(err));
        }
      )
    });
    return promise;
  }

  bannerListing() : Promise<any>{
    var Uri = this.globals.get('appConfig').apiUrl+'listing/banners/?dummy=true';
    let promise = new Promise((resolve, reject) => {
        this.http.get(Uri)
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
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }

  templatetListing(filter) : Promise<any>{
    var Uri = this.globals.get('appConfig').apiUrl+'listing/templates?dummy=true';
    if(typeof filter == 'object') {
      console.log(filter);
      if(typeof filter.page != typeof undefined) {
        Uri += "&page="+filter.page;
      }
      if(typeof filter.perpage != typeof undefined) {
        Uri += "&perpage="+filter.perpage;
      }
      if(filter.q) {
        Uri += '&q=' + filter.q;
      } 
      if(filter.id) {
        Uri += '&id=' + filter.id;
      } 
      if(filter.cid) {
        Uri += '&cid=' + filter.cid;
      } 
      if(filter.pid) {
        Uri += '&pid=' + filter.pid;
      } 
      if(filter.sort) {
        Uri += '&sort=' + filter.sort;
      }
    }
    let promise = new Promise((resolve, reject) => {
        this.http.get(Uri)
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
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }

  wishlist(data) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
        this.http.post(this.globals.get('appConfig').apiUrl+'customers/add-to-wishlist', data)
        .toPromise()
        .then(       
          (data:any) => {
            if(data != null) {
              resolve(data);
            } else {
              resolve(false);
            }
          }, 
          (err:any) => {
            this.globals.showErrorAlert(this.getError(err));
            // this.globals.showToast(failuretoast);
            reject(this.getError(err));
          }
        )
    });
    return promise;
  }

  wishlistListing(params) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
        var Url = this.globals.get('appConfig').apiUrl+'customers/my-wishlist?dummy=true';
        if(typeof params.page != typeof undefined) {
            Url += "&page="+params.page;
        }
        if(typeof params.perpage != typeof undefined) {
            Url += "&perpage="+params.perpage;
        }
        this.http.get(Url, params)

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
              reject(this.getError(err));
          }
        )
    });
    return promise;
  }

  orderListing(params) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
        var Url = this.globals.get('appConfig').apiUrl+'orders/list-orders?dummy=true';
        if(typeof params.page != typeof undefined) {
            Url += "&page="+params.page;
        }
        if(typeof params.perpage != typeof undefined) {
            Url += "&perpage="+params.perpage;
        }
        this.http.get(Url, params)

        .toPromise()
        .then(       
          (data:any) => {
              if(typeof data == 'object') {


               
                data.forEach(order => {

                  let total_delivery_charge = 0;
                  let total_custom_design_charge = 0;
          

                  order.order_items.forEach(orderItem => {

                
                    orderItem.final_price = orderItem.final_price - orderItem.delivery_charge - orderItem.custom_design_charge;
                    orderItem.unitPrice = orderItem.final_price / orderItem.qty;
        
                    total_delivery_charge += orderItem.delivery_charge;
                    total_custom_design_charge += orderItem.custom_design_charge;

                  });

                  if(order.order_items.length){
                    order.order_master.total_delivery_charge = total_delivery_charge;
                    order.order_master.total_custom_design_charge = total_custom_design_charge;
                  }
        
                  
                });
        
               



                  resolve(data);
              } else {
                  resolve(false);
              }
          }, 
          (err:any) => {
              reject(this.getError(err));
          }
        )
    });
    return promise;
  }

  orderDetails(param) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
      var Url = this.globals.get('appConfig').apiUrl+'orders/orders-detail?dummy=true';
      if(typeof param != typeof undefined) {
        Url += "&id="+param;
      }
      this.http.get(Url, param)
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
          reject(this.getError(err));
        }
      )
    });
    return promise;
  }

  createOrder(data) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
        this.http.post(this.globals.get('appConfig').apiUrl+'orders/create-new-order', data)
        .toPromise()
        .then(       
            (data:any) => {
                if(typeof data == 'object') {
                    // this.globals.showToast(successtoast);
                    resolve(data);
                } else {
                    resolve(false);
                }
            }, 
            (err:any) => {
                
                this.globals.showErrorAlert(this.getError(err));
                // this.globals.showToast(failuretoast);
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }

  updateOrder(data) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
        this.http.post(this.globals.get('appConfig').apiUrl+'orders/manage-status', data)
        .toPromise()
        .then(       
            (data:any) => {
                if(typeof data == 'object') {
                    // this.globals.showToast(successtoast);
                    resolve(data);
                } else {
                    resolve(false);
                }
            }, 
            (err:any) => {
                
                this.globals.showErrorAlert(this.getError(err));
                // this.globals.showToast(failuretoast);
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }
  
  postReview(data) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
        this.http.post(this.globals.get('appConfig').apiUrl+'orders/write-new-comment', data)
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
                
                this.globals.showErrorAlert(this.getError(err));
                // this.globals.showToast(failuretoast);
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }


  uploadProfilePicture(data) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
        this.http.post(this.globals.get('appConfig').apiUrl+'customers/set-profile-picture', data)
        .toPromise()
        .then(       
            (data:any) => {
                console.log(data);
                resolve(data);
            }, 
            
            (err:any) => {
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }

  profileUpdate(info) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
        this.http.post(this.globals.get('appConfig').apiUrl+'customers/update-profile', info)
        .toPromise()
        .then(       
            (data:any) => {
                if(typeof data == 'object') {
                    this.globals.showSuccessAlert('Profile has been updated successfully!');
                    // this.globals.showToast(successtoast);
                    resolve(data);
                } else {
                    resolve(false);
                }
            }, 
            (err:any) => {
                
                this.globals.showErrorAlert(this.getError(err));
                // this.globals.showToast(failuretoast);
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }

  passwordUpdate(password) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
        this.http.post(this.globals.get('appConfig').apiUrl+'customers/change-password', password)
        .toPromise()
        .then(       
          (data:any) => {
              if(typeof data == 'object') {
                  this.globals.showSuccessAlert('Password has been updated successfully!');
                  // this.globals.showToast(successtoast);
                  resolve(data);
              } else {
                  resolve(false);
              }
          }, 
          (err:any) => {
              this.globals.showErrorAlert(this.getError(err));
              // this.globals.showToast(failuretoast);
              reject(this.getError(err));
          }
        )
    });
    return promise;
  }

  testimonialsListing() : Promise<any>{
    let promise = new Promise((resolve, reject) => {
      this.http.get(this.globals.get('appConfig').apiUrl+'active-testimonials')
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
          reject(this.getError(err));
        }
      )
    });
    return promise;
  }

  fetchFile = (id) => {
    let promise = new Promise((resolve, reject) => {
      this.http.get(this.globals.get('appConfig').apiUrl+'files/get/'+id)
      .toPromise()
      .then(       
        (data:any) => {
          console.log(typeof data);
          if(typeof data == 'object') {
              resolve(data);
          } else {
              resolve(false);
          }
        }, 
        (err:any) => {
          reject(this.getError(err));
        }
      );
    });
    return promise;
  }

  contactHelp(data) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
        this.http.post(this.globals.get('appConfig').apiUrl+'reach-us', data)
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
                
                this.globals.showErrorAlert(this.getError(err));
                // this.globals.showToast(failuretoast);
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }

  settings() : Promise<any>{
    var Uri = this.globals.get('appConfig').apiUrl+'public-settings';
    let promise = new Promise((resolve, reject) => {
        this.http.get(Uri)
        .toPromise()
        .then(       
            (data:any) => {
                if(typeof data == 'object') {
                    this.globals.settings = {
                      customerSupportEmail: data.customerSupportEmail01,
                      customerSupportContactNumber: data.customerSupportContactNo01,
                      customerSupportWebSite: data.customerSupportWebSite,
                      companyAddressLine1: data.companyAddressLine1,
                      companyAddressLine2: data.companyAddressLine2,
                      socialFacebookLink: data.socialFacebookLink,
                      socialInstagramLink: data.socialInstagramLink,
                      socialTwitterLink: data.socialTwitterLink,
                      freeShippingAbove:data.freeShippingAbove
                    };
                    resolve(data);
                } else {
                    resolve(false);
                }
            }, 
            (err:any) => {
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }

  faqListing(filter) : Promise<any>{
    var Uri = this.globals.get('appConfig').apiUrl+'faqs/'+'?dummy=true';
    if(typeof filter == 'object') {
      if(typeof filter.page != typeof undefined) {
        Uri += "&page="+filter.page;
      }
      if(typeof filter.perpage != typeof undefined) {
        Uri += "&perpage="+filter.perpage;
      }
    }
    let promise = new Promise((resolve, reject) => {
        this.http.get(Uri)
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
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }

  pageListing() : Promise<any>{
    var Uri = this.globals.get('appConfig').apiUrl+'active-static-pages/'+'?dummy=true';
    let promise = new Promise((resolve, reject) => {
        this.http.get(Uri)
        .toPromise()
        .then(       
            (data:any) => {
                if(typeof data == 'object') {
                    this.globals.pages = data;
                    resolve(data);
                } else {
                    resolve(false);
                }
            }, 
            (err:any) => {
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }

  checkNewsletterSubscription() : Promise<any>{
    let promise = new Promise((resolve, reject) => {
        this.http.get(this.globals.get('appConfig').apiUrl+'customers/check-newletter-subscription')
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
                
                // this.globals.showErrorAlert(this.getError(err));
                // this.globals.showToast(failuretoast);
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }

  subscribeNewsletter(data) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
        this.http.post(this.globals.get('appConfig').apiUrl+'subscribe-newsletter', data)
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
                
                this.globals.showErrorAlert(this.getError(err));
                // this.globals.showToast(failuretoast);
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }

  unsubscribeNewsletter(data) : Promise<any>{
    let promise = new Promise((resolve, reject) => {
        this.http.post(this.globals.get('appConfig').apiUrl+'unsubscribe-newsletter', data)
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
                
                this.globals.showErrorAlert(this.getError(err));
                // this.globals.showToast(failuretoast);
                reject(this.getError(err));
            }
        )
    });
    return promise;
  }

  getError (err){
      var error = err['error'];
      if(typeof error[0] != 'string'){
        return error.errors[0].msg;
      } else {
        return error;  
      }
  }

  
}