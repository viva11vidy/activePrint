import { Component, OnInit, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import {  Router, ActivatedRoute } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';

import { GlobalsService } from './../../providers/globals-service';
import { UserService } from './../../providers/user-service';
import { AuthService } from './../../providers/auth-service';

@Component({
  selector: 'app-category-listing',
  templateUrl: './category-listing.component.html',
  styleUrls: ['./category-listing.component.scss']
})
export class CategoryListingComponent implements OnInit {


  targetCatId;
  category;
  parentCategory;

  skeletonLoading:boolean = true;
  isLoaded:boolean = false;
  reachedToTop:boolean = false;

  addedToWishlist = false;
  public publicSorting = '';
  


  constructor(private globals: GlobalsService, public userService: UserService, public loader: LoadingBarService, public router: Router, public auth: AuthService, public location: Location, public activatedRoute: ActivatedRoute) {

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.activatedRoute.params.subscribe(params => {
      this.targetCatId = params['catId'];
      if(this.targetCatId == 'all') {
        this.targetCatId = false; 
      } else {
        
      }
      this.getCategories();
    });
    
  }

  @HostListener('window:scroll', ['$event']) onScrollEvent($event){
    // console.log($event);
    // console.log($event.target['scrollingElement'].scrollTop);

    if($event.target['scrollingElement'].scrollTop >= 480){
      this.reachedToTop = true;
    } else {
      this.reachedToTop = false;
    }
    if($event.target['scrollingElement'].scrollHeight - $event.target['scrollingElement'].scrollTop <= 1200){
      this.reachedToTop = false;
    }
  } 


  // onScroll(event) {
  //   console.log(event);
  // }

  async getCategories(){
    try {
      let data = await this.userService.categoryListing({page:1});
      if(!this.targetCatId) {
        this.category = {
          name: 'All Products',
          _id: null,
          child: data
        };
      } else {
        data.forEach((cat, catIndex) => {
          if(!this.category) {
            if(cat._id == this.targetCatId) {
              this.category = cat;
            } else {
              cat.child.forEach((subCat, subCatIndex) => {
                if(!this.category) {
                  if(subCat._id == this.targetCatId) {
                    this.category = subCat;
                    this.parentCategory = cat;
                  } 
                }
              });
            }
          }
        });
      }
      console.log(this.parentCategory);
    } catch(err) {

    }
    this.loader.complete();
      this.skeletonLoading = false;
      this.isLoaded = true;
  }

  getProducts(){
    this.skeletonLoading = true;
    let params = {
      cid:this.targetCatId,
      perpage:10,
      page:1,
      sort:this.publicSorting,
    }
    // if(this.searchString){
    //   this.showingSuggestedKeyword = true; // if input has value then only showing text would show
    // } else {
    //   this.showingSuggestedKeyword = false;
    // }
    this.loader.start();
    this.isLoaded = false;
    this.userService.productListing(params).then(function(data){
      if(data){
        this.products = data;
        this.products.forEach(element => {
          if(element.wishitem &&element.wishitem.length){
            element.addedToWishlist = true;
          } else {
            element.addedToWishlist = false;
          }
        });
        this.loader.complete();
        this.skeletonLoading = false;
        this.isLoaded = true;
      }
    }.bind(this), function(err) {
      this.loader.complete();
      this.skeletonLoading = false;
      this.isLoaded = true;
    }.bind(this));
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
      if(data) {
        this.products[index].addedToWishlist = true;
        this.globals.showSuccessAlert(this.products[index].name+' has been added to your wishlist');
        console.log('success');
      } else {
        this.products[index].addedToWishlist = false;
        this.globals.showSuccessAlert(this.products[index].name+' has been removed from your wishlist');
        console.log('failed');
      }
      this.loader.complete();
    }.bind(this), function(err) {
      this.loader.complete();
    }.bind(this));
  }


  ngOnInit() {
    
  }

 

  

 


}
