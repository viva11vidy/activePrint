import { Injectable, Component } from '@angular/core';
import { AlertService } from '@full-fledged/alerts';

@Injectable()
export class GlobalsService {
 
    public successMessage = ''; 
    public errorMessage = ''; 

    public validateTokenCallComplete = false;
    public  params = [];
    public firebaseToken = '';

    public loader = [];
    public showloginModal:boolean = false;
    public viewingDesign:any = null;

    public settings = {
        customerSupportEmail: '',
        customerSupportContactNumber: '',
        customerSupportWebSite: '',
        companyAddressLine1: '',
        companyAddressLine2: '',
        socialFacebookLink: "",
        socialInstagramLink: "",
        socialTwitterLink: "",
        freeShippingAbove: 0
    };
    public pages = [];

    //for chat
    public socket;
    public userList = [];
    public unreadChats = 0;
    public onlineUsers = [];
    public newMessage = {};
    public readingChats: boolean = false;
    public readingChatsOf = '';
    public supportChatUserID = '607686d87bf650ed8e9bb188';
    //for chat

    private appConfig = {
        // apiUrl: 'https://ap.dtsdev.xyz:3000/api/',
        // chatUrl: 'https://ap.dtsdev.xyz:3000/',
        // liveUrl: 'https://ap.dtsdev.xyz/',

        apiUrl: 'https://activeprints.in:3020/api/',
        chatUrl: 'https://activeprints.in:3020/',
        liveUrl: 'https://activeprints.in/',

        // apiUrl: 'http://localhost:3051/api/',
    };




    

    constructor(private alertService: AlertService){
  
    }

    
    removeByKey(array, params){
        var tmp = [];
        if(Array.isArray(array)){
            array.forEach(element => {
                if(element[params]==undefined){
                    tmp.push(element) 
                } 
            });   
            return tmp;
        }    
        return [];
    }

    // Login a user
    // Normally make a server request and store
    // e.g. the auth token

    get(key) {
        return this[key];
    }
    

    showSuccessAlert(msg){
        this.alertService.success(msg);
    }
    
    showErrorAlert(msg){
        this.alertService.danger(msg);
    }

    openLoginModal(){
        this.showloginModal = true;
    }
    closeLoginModal(){
        this.showloginModal = false;
    }


    encodeQueryString(qobject) {
        return btoa(unescape(encodeURIComponent(JSON.stringify(qobject))));
    }

    decodeQueryString(qstring) {
        return JSON.parse(decodeURIComponent(escape(atob(qstring))));
    }

    updateListView(list, item) {
      if(item._id) {
          list.forEach((element, index) => {
              if(element._id == item._id) {
                  list[index] = item;
              }
          });
      }
    }   

    addToRemoveListView(list, item) {
      if(item._id) {
          var match = false;
          list.forEach((element, index) => {
              if(element._id == item._id && !match) {
                  list.splice(index, 1);
                  match = true;
              }
          });
          if(!match) {
              list.push(item);
          }
      }
    }

    

    IsValidJsonString(str) {
      try {
          JSON.parse(str);
      } catch (e) {
          return false;
      }
      return true;
    }

    

    errorImageHandler(event) {
        //console.debug(event);
        event.target.src = "assets/images/global/black.jpg";
    }

    isOnline(modelId) {
      let model:any = this.onlineUsers.filter(model => {
          return model._id == modelId;
      });
      return model[0]? true : false;
    }
  
    getOnlineUserInfo(userId) {
      let user:any = this.onlineUsers.filter(user => {
          return user._id == userId;
      });
      return user[0]? user[0] : false;
    }
  
    getChatUserInfo(userId) {
      let user:any = this.userList.filter(user => {
          return user._id[0]._id == userId;
      });
      return user[0]? user[0]._id[0] : false;
    }
    

}
    
