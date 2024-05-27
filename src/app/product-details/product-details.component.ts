import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import {  Router, ActivatedRoute } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { trigger, style, animate, transition } from '@angular/animations';

import { GlobalsService } from './../../providers/globals-service';
import { UserService } from './../../providers/user-service';
import { AuthService } from './../../providers/auth-service';
import { PinchZoomComponent } from 'ngx-pinch-zoom';
import { of } from 'rxjs';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
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
  ]
})
export class ProductDetailsComponent implements OnInit {

  @ViewChild('mainImg') mainImg:ElementRef;
  @ViewChild('pinch') pinchZoom: PinchZoomComponent;

  targetProductId;
  product;
  products;
  category;
  parentCategory;

  skeletonLoading:boolean = true;
  isLoaded:boolean = false;

  selectedMainImage;
  selectedVariationIndex = 1;
  selectedQtyIndex = 0;
  selectedIndex;
  subProductsForCarousel;

  property:any[] = [];
  productDisplayPrice = 0;

  fadeInClassToggle : boolean = false;

  startDesigningProductID;
  templates;

  constructor(private globals: GlobalsService, public userService: UserService, public loader: LoadingBarService, public router: Router, public auth: AuthService, public location: Location, public activatedRoute: ActivatedRoute) {

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.activatedRoute.params.subscribe(params => {
      this.targetProductId = params['productId'];
      if(this.targetProductId == 'all') {
        this.targetProductId = false; 
      } else {
        this.getSpecificProduct();
       
      }
    });
    
  }

  async getParentCategory(targetCatId){
    try {
      let data = await this.userService.categoryListing({page:1});
      data.forEach((cat, catIndex) => {
        if(!this.category) {
          if(cat._id == targetCatId) {
            this.category = cat;
          } else {
            cat.child.forEach((subCat, subCatIndex) => {
              if(!this.category) {
                if(subCat._id == targetCatId) {
                  this.category = subCat;
                  this.parentCategory = cat;
                } 
              }
            });
          }
        }
      });
    } catch(err) {

    }
  }

  getSpecificProduct() {
    this.loader.start();
    this.skeletonLoading = true;
    this.userService.productListing({id:this.targetProductId}).then(async data => {
      if(data){
        data[0].properties = data[0].properties.map(el => { return { ...el, property: {...el.property, selected: -1, disabled: []} }});
        data[0].price_variations = data[0].price_variations.filter(el => el.is_active == true);
        this.product = data[0];
        await this.getParentCategory(this.product.category[0]._id);
        if(this.product.wishitem && this.product.wishitem.length){
          this.product.addedToWishlist = true;
        } else {
          this.product.addedToWishlist = false;
        }

        this.selectedVariationIndex = 1;
        this.selectedQtyIndex = 0;
        

        this.displayDisabledOptions();
        this.displayProductAttributeSelection();
        this.displaySelectedPrice();

        this.fetchTemplates();

        this.selectedMainImage = this.product.images[0].regular;
        this.selectedIndex = 0;
       
        this.getRelatedProducts();
        // data.forEach((element,index) => {
        //   if(element.parent == null){
        //     this.categories.push(element);
        //   }
        // });
        this.skeletonLoading = false;
        this.loader.complete();
      }
    }, err => {
      this.skeletonLoading = false;
      this.loader.complete();
    });
  }

  setIndex(imageSrc, index){
    this.selectedMainImage = imageSrc;
    this.selectedIndex = index;
  }

  changeMainImage(indexPostion){
    if(indexPostion == '-1'){
      if(this.selectedIndex > 0){
        this.selectedIndex -= 1;
        this.fadeInClassToggle = !this.fadeInClassToggle;
        setTimeout(() => {
          this.fadeInClassToggle = !this.fadeInClassToggle;
        }, 50);
      }
    } else if(indexPostion == '+1'){
      if(this.selectedIndex < (this.product.images.length-1)){
        this.selectedIndex += 1;
        this.fadeInClassToggle = !this.fadeInClassToggle;
        setTimeout(() => {
          this.fadeInClassToggle = !this.fadeInClassToggle;
        }, 50);
      }
    }
    this.selectedMainImage = this.product.images[this.selectedIndex].regular;
  }

  

  getRelatedProducts(){
    let params = {
      cid:this.product.category[0]._id,
    }
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
        this.products.forEach((element,index) => {
          if(element._id == this.targetProductId){
            this.products.splice(index, 1);
          }
        });
        this.splitPairs(this.products);
      }
    }.bind(this), function(err) {
    }.bind(this));
  }

  splitPairs(arr,type) {
    // for bootstrap carousel
    var pairs = [];
    for (var i=0 ; i<arr.length ; i+=4) {
      // if (arr[i+1] !== undefined && arr[i+2] !== undefined && arr[i+3] !== undefined && arr[i+4] !== undefined) {
      //   pairs.push ([arr[i], arr[i+1], arr[i+2], arr[i+3], arr[i+4]]);
      // } else 
      if (arr[i+1] !== undefined && arr[i+2] !== undefined && arr[i+3] !== undefined) {
        pairs.push ([arr[i], arr[i+1], arr[i+2], arr[i+3]]);
      } else if (arr[i+1] !== undefined && arr[i+2] !== undefined) {
        pairs.push ([arr[i], arr[i+1], arr[i+2]]);
      } else if(arr[i+1] !== undefined) {
        pairs.push ([arr[i], arr[i+1]]);
      } else {
        pairs.push ([arr[i]]);
      }
    }
    this.subProductsForCarousel = pairs;
    console.log(this.subProductsForCarousel);
  };

  displayProductAttributeSelection() {
    this.product.price_variations[this.selectedVariationIndex].variation.forEach(selectedVariationGroup => {
      this.product.properties.forEach((property, propertyIndex) => {
          property.property.options.forEach((option, optionIndex) => {
            // console.log(selectedVariationGroup, property.property);
            if(
              selectedVariationGroup.grpid ==  property._id &&
              selectedVariationGroup.propid == option._id) {
              this.product.properties[propertyIndex].property.selected = optionIndex;
            }
          });
      });
    });
  }

  displayDisabledOptions() {

    let availableOptions = {};
    this.product.properties.forEach(property => {
      property.property.options.forEach(option => {
        if(!availableOptions.hasOwnProperty(property._id)) {
          availableOptions[property._id] = [option._id];
        } 
        if(availableOptions[property._id].indexOf(option._id) == -1) {
          availableOptions[property._id].push(option._id);
        }
      });
    });
    
    // console.log(availableOptions);

    this.product.price_variations[this.selectedVariationIndex].variation.forEach((selectedVariationOption, selectedVariationOptionIndex) => {
      
      let selectedPriceVariations = [];
      let availableOtherOptionsForSelectedVariationOption = {};

      this.product.price_variations.forEach((variationGroup, variationGroupIndex) => {
        let matched = true;
        variationGroup.variation.forEach(variationOption => {
          for(let i = 0; i < this.product.price_variations[this.selectedVariationIndex].variation.length; i++) {
            if(matched && i != selectedVariationOptionIndex && this.product.price_variations[this.selectedVariationIndex].variation[i].grpid ==  variationOption.grpid && this.product.price_variations[this.selectedVariationIndex].variation[i].propid != variationOption.propid) {
              matched = false;
            } else {
              // console.log('variationGroup matched', i, variationOption, this.product.properties.find(el => el._id == variationOption.grpid).property.group, this.product.properties.find(el => el._id == variationOption.grpid).property.options.find(el => el._id == variationOption.propid).name);
            }
          }
          
        });
        if(matched) {
          selectedPriceVariations.push(variationGroup);
        }
      });

      // console.log('selectedPriceVariations', selectedPriceVariations);
      selectedPriceVariations.forEach((variationGroup, variationGroupIndex) => {
        variationGroup.variation.forEach((variationOption, variationOptionIndex) => {
          if(selectedVariationOption.grpid ==  variationOption.grpid /*&& variationOptionIndex > selectedVariationOptionIndex*/) {
            if(!availableOtherOptionsForSelectedVariationOption.hasOwnProperty(variationOption.grpid)) {
              availableOtherOptionsForSelectedVariationOption[variationOption.grpid] = [];
            } 
            if(availableOtherOptionsForSelectedVariationOption[variationOption.grpid].indexOf(variationOption.propid) == -1) {
              availableOtherOptionsForSelectedVariationOption[variationOption.grpid].push(variationOption.propid);
            }
          }
        });
      });

      // console.log(availableOtherOptionsForSelectedVariationOption);
      Object.keys(availableOptions).forEach(key => {
        if(availableOtherOptionsForSelectedVariationOption.hasOwnProperty(key)) {
          availableOptions[key].forEach((value, index) => {
            if(availableOtherOptionsForSelectedVariationOption[key].indexOf(value) == -1) {
              availableOptions[key].splice(index, 1);
            }
          });
        }
      });
      // console.log('availableOptions', JSON.parse(JSON.stringify(availableOptions)));
    });

    this.product.properties.forEach(property => {
      let disabled = [];
      property.property.options.forEach((option, optionIndex) => {
        if(availableOptions[property._id].indexOf(option._id) == -1) {
          if(disabled.indexOf(optionIndex) == -1) {
            disabled.push(optionIndex);
          }
        }
      });
      property.property.disabled = disabled;
    });

  }

  displaySelectedPrice() {

    let selectedVariationIndex = -1;
    //console.log(this.product.properties);
    this.product.price_variations.forEach((priceVariation, priceVariationIndex) => { //console.log(priceVariation.variation.map(el => el.group+' | '+el.property));
      if(selectedVariationIndex == -1) { // still selectedVariation not found
        let priceVariationGroupMatched = true; 

        priceVariation.variation.forEach((priceVariationGroup, priceVariationGroupIndex) => {
          if(priceVariationGroupMatched) {//console.log(priceVariationIndex, priceVariationGroupIndex, priceVariationGroup.group, priceVariationGroup.property);
            if(this.product.properties.findIndex(propertyEl => propertyEl._id == priceVariationGroup.grpid) !== -1) {
              let searchingGroup = this.product.properties.find(propertyEl => propertyEl._id == priceVariationGroup.grpid);
              //console.log(priceVariationGroupMatched, priceVariationIndex, searchingGroup.property.group, searchingGroup.property.options[searchingGroup.property.selected].name);
              if(
                priceVariationGroup.grpid ==  searchingGroup._id && 
                priceVariationGroup.propid == searchingGroup.property.options[searchingGroup.property.selected]._id
              ) {
                
                // propertyValueMatched = true;
                // console.log('matched', priceVariationIndex, priceVariationGroup.group, priceVariationGroup.property);
              } else {
                priceVariationGroupMatched = false;
                // propertyValueMatched = false;
                // console.log(propertyValueMatched, priceVariationIndex, priceVariationGroup.group, priceVariationGroup.property);
              }
            }
          }
        });
        // console.log(priceVariationGroupMatched);
        if(priceVariationGroupMatched) {
          selectedVariationIndex = priceVariationIndex;
          this.selectedVariationIndex = selectedVariationIndex;
          this.selectedQtyIndex = Math.min(this.selectedQtyIndex, this.product.price_variations[this.selectedVariationIndex].pricing.length - 1);
          this.productDisplayPrice = this.product.price_variations[this.selectedVariationIndex].pricing[this.selectedQtyIndex].price;
        }
      }
    });
      
  }

  onSelectProductAttribute(selectedGroupIndex, selectedOptionIndex){


    if(this.product.properties[selectedGroupIndex].property.disabled.indexOf(selectedOptionIndex) != -1) {
      let selectedPropertyName = this.product.properties[selectedGroupIndex].property.options[selectedOptionIndex].name;
      if(!confirm(
        selectedPropertyName + " is incompatible with other selections. " + 
        "I want " + selectedPropertyName + ", please show me what other options are available"
      )) {
        return false;
      }

      let selectedVariationIndex = -1;
      this.product.price_variations.forEach((variationGroup, variationGroupIndex) => {
        if(selectedVariationIndex == -1) {
          variationGroup.variation.forEach(variationOption => {
            if(selectedVariationIndex == -1 && this.product.properties[selectedGroupIndex]._id ==  variationOption.grpid && this.product.properties[selectedGroupIndex].property.options[selectedOptionIndex]._id == variationOption.propid) {
              selectedVariationIndex = variationGroupIndex;
              this.selectedVariationIndex = selectedVariationIndex;
              this.displayProductAttributeSelection();
              this.displaySelectedPrice();
            }
          });
        }
      });
    }

    this.product.properties[selectedGroupIndex].property.selected = selectedOptionIndex;
    this.displaySelectedPrice();
    this.displayDisabledOptions();
  }

  onSelectProductQty(e) {
 
    this.selectedQtyIndex = e.target.selectedIndex;
    this.displaySelectedPrice();

  }

  
  addToCart() {
    let data = {
      item: this.product._id,
      pvid: this.product.price_variations[this.selectedVariationIndex]._id,
      prcid: this.product.price_variations[this.selectedVariationIndex].pricing[this.selectedQtyIndex]._id
    };
    this.loader.start();
    this.auth.addToCart(data).then(function(data){
      this.globals.showSuccessAlert(data.product.info.name+' has been added to the cart');  
      console.log(data);

      this.loader.complete();
    }.bind(this), function(err) {
      this.loader.complete();
    }.bind(this));

    // console.log(data);

  }

  goToDesigningPage(recievedProductID){
    console.log(recievedProductID);
    this.startDesigningProductID = recievedProductID;
  }

  ngOnInit() {
    
  }

  async fetchTemplates() {
    this.loader.start();
    this.skeletonLoading = true;
    try {
     
      this.templates = await this.userService.templatetListing({pid:this.targetProductId});
      console.log(this.templates);
    } catch(err) {

    }
    this.skeletonLoading = false;
    this.loader.complete();
  }



 




  addToRelatedWishlist(productid, index){
    let userParams = {
      eid : productid,
      type: 'Product'
    };
    this.loader.start();
    this.userService.wishlist(userParams).then(function(data){
      if(data) {
        this.subProductsForCarousel.forEach((element,index) => {
          if(element[index]._id == productid){
            element[index].addedToWishlist = true;
            this.globals.showSuccessAlert(this.product.name+' has been added to your wishlist');
            console.log('success');
          }
        });
      } else {
        this.subProductsForCarousel.forEach((element,index) => {
          if(element[index]._id == productid){
            element[index].addedToWishlist = false;
            this.globals.showSuccessAlert(this.product.name+' has been removed from your wishlist');
            console.log('failed');
          }
        });
      }
      this.loader.complete();
    }.bind(this), function(err) {
      this.loader.complete();
    }.bind(this));
  }

  addToWishlist(productid, index){
    let userParams = {
      eid : productid,
      type: 'Product'
    };
    this.loader.start();
    this.userService.wishlist(userParams).then(function(data){
      if(data) {
        this.product.addedToWishlist = true;
        this.globals.showSuccessAlert(this.product.name+' has been added to your wishlist');
        console.log('success');
      } else {
        this.product.addedToWishlist = false;
        this.globals.showSuccessAlert(this.product.name+' has been removed from your wishlist');
        console.log('failed');
      }
      this.loader.complete();
    }.bind(this), function(err) {
      this.loader.complete();
    }.bind(this));
  }

 
  goToProductDetailsPage(productID,productSlug){
    this.router.navigate(['/product/'+productSlug+'/'+productID]); 
  }
 


}
