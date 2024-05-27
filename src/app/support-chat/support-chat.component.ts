import { Component, OnInit, AfterViewChecked,  ViewChild, OnDestroy } from '@angular/core';

import { AuthService } from './../../providers/auth-service';
import { GlobalsService } from './../../providers/globals-service';

@Component({
  selector: 'app-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss']
})
export class SupportChatComponent implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChild('chatMessageArea')  chatMessageArea: any;
  @ViewChild('chatinput') chatinput : any;

  userFilter: any = { searchField: '' };
  private socket;
  chatUser = { _id: this.globals.supportChatUserID };
  me = {
    id: null,
    shop_user_id: null,
    image: null,
    name: null,
    socket: null
  };
  message = {
    _id: null,
    to: null,
    shop_user_id: null,
    from: null,
    data: null
  };
  messageListLoaded = false;
  messageList = [];
  chatText = '';
  isTyping = false;

  displayWidth = 0;
  mediaAspectRatio = 0.65;
  videoWidth = this.displayWidth * 0.65;
  textAreaInitialHeight = 0;
  textAreaPadding = 0;
  textAreaExtraHeight = 0; // use only textarea increase / autogrow
  backToNormalTextAreaHeight = 0;
  canScrollToBottom = false;

  constructor(public auth: AuthService, public globals: GlobalsService) {}

  ngOnInit(): void {
    this.initMessageList();
    this.globals.readingChats = true;
    this.globals.readingChatsOf = this.message.to;
  }

  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   if(this.chatinput) {
    //     let  textArea = this.chatinput.nativeElement; 
    //     this.textAreaInitialHeight = textArea.offsetHeight;
    //     this.textAreaPadding = textArea.offsetHeight - textArea.scrollHeight;
    //     this.displayWidth = this.chatMessageArea.nativeElement.offsetWidth; 
    //     this.videoWidth = this.displayWidth * this.mediaAspectRatio;
    //   }
    // });
  }

  ngAfterViewChecked(): void {    
    if(this.canScrollToBottom) {
      this.scrollToBottom();        
    }
  } 

  ngOnDestroy(): void {
    this.globals.socket.off('msgGot');
    this.globals.socket.off('msgSent');
    this.globals.socket.off('msgReceived');
    this.globals.socket.off('isTyping');
    this.globals.socket.off('msgRead');
    this.globals.readingChats = false;
    this.globals.readingChatsOf = '';
  }

  initMessageList() {

    this.messageListLoaded = false;

    this.me.id = this.auth.user._id;
    this.message.from = this.auth.user._id;
    if(this.chatUser._id) {
      this.message.to = this.chatUser._id;
    }
    

    if(typeof this.auth.user.shop_id != typeof undefined) {
      this.me.shop_user_id = this.auth.user.shop_id;
      this.message.shop_user_id = this.auth.user.shop_id;
    }

    this.socket = this.globals.socket;
    this.me.socket = this.globals.socket;

    if(this.message.to) {
      setTimeout(() => {
        this.socket.emit('msgGetting', this.message);
      }, 20);
    } else {
      setTimeout(() => {
        this.socket.emit('usersGetting');
      }, 20);
    }

    this.socket.on('userList', (userList) => {
      if(userList) {
        console.log(userList);
        this.globals.userList = userList;
        this.messageListLoaded = true;
      }
    });

    this.socket.on('msgGot', (messageList) => {
      if(messageList) {
        this.messageList = this.retainIdenticalMessages(this.readingMessages(messageList));
        this.canScrollToBottom = true;
        this.messageListLoaded = false;
      }
    });

    this.socket.on('msgSent', (messageList) => {
      if(messageList) {
        if(messageList[0].from == this.message.to || messageList[0].to == this.message.to) {
          this.messageList = this.retainIdenticalMessages(messageList);
          this.canScrollToBottom = true;
        }
      }
    });

    this.socket.on('msgReceived', (messageList) => {
      if(messageList) {
        if(messageList[0].from == this.message.to || messageList[0].to == this.message.to) {
          this.messageList = this.retainIdenticalMessages(this.readingMessages(messageList));
          this.canScrollToBottom = true;
        }
      }
    });

    this.socket.on('isTyping', (typing) => {
          
      if(this.message.to == typing.from) {
        
        if(!this.isTyping) {
          this.isTyping = true;
          setTimeout(() => {
            
              this.isTyping = false;
            
          }, 2000);
        }
      }
     });

    this.socket.on('msgRead', (readMessages) => {
      //console.log(readMessages);
      this.readMessages(readMessages);
      
    });

  }

  sendScrollingNotification($event) {
    this.canScrollToBottom = false;
  }

  scrollToBottom() {
    try {
      this.chatMessageArea.nativeElement.scrollTop = this.chatMessageArea.nativeElement.scrollHeight;
    } catch(err) { } 
  } 

  scroll(el: HTMLElement) {
    if(window.innerWidth < 600){
      el.scrollIntoView({behavior: 'smooth'});
    }
  }

  autogrow(){
    let textArea = this.chatinput.nativeElement;  

    textArea.style.height = '1px'; 
    let textAreaHeight = textArea.scrollHeight + this.textAreaPadding;
    this.backToNormalTextAreaHeight = textArea.offsetHeight;
    
    textArea.style.height = textAreaHeight + 'px';
    this.textAreaExtraHeight =  Math.min(textAreaHeight, textArea.offsetHeight) - this.textAreaInitialHeight;

  }

  backtoNormalHeight(){
    let textArea = this.chatinput.nativeElement;  
    let textAreaHeight = textArea.scrollHeight + this.textAreaPadding;
    textArea.style.height = this.backToNormalTextAreaHeight + 'px'; 
    this.textAreaExtraHeight =  Math.min(textAreaHeight, textArea.offsetHeight) - this.textAreaInitialHeight;
  }

  readingMessages(messages) {
    this.message.to = this.chatUser._id;
    var unreadMessages = {
      to: this.me.id,
      from: this.message.to,
      chats: []
    };
    if(messages.length) {
      for (var i in messages) {
        if(typeof messages[i].unread != typeof undefined && messages[i].unread == 1 && messages[i].to == this.me.id) {
          unreadMessages.chats.push(messages[i]._id);
          messages[i].unread = 0;
        }
      }
    }
    console.log(unreadMessages);
    if(unreadMessages.chats.length) {

      if(this.globals.userList.length) {
        for (var j in this.globals.userList) {
          if(this.globals.userList[j]._id[0]._id == this.message.to) {
            this.globals.userList[j].chatCount = Math.max(parseInt(this.globals.userList[j].chatCount) - unreadMessages.chats.length, 0);
          }
          
        }
        this.globals.unreadChats = 0;
        for(var k in this.globals.userList) {
          if(this.globals.userList[k].chatCount) {
              this.globals.unreadChats += parseInt(this.globals.userList[k].chatCount);
          }
        }
        // if(this.globals.unreadChats == 0) {
        //   this.userService.hideChatNotifications();
        // }
      }
      this.socket.emit('msgReading', unreadMessages);
    }
    
    return messages;
  }

  readMessages(messages) {
    if(this.messageList.length) {
      if(this.messageList[0].from == messages.from || this.messageList[0].to == messages.from) {
        for (var i in this.messageList) {
          for (var j in messages.chats) {
            if(this.messageList[i]._id == messages.chats[j]) {
              this.messageList[i].unread = 0;
            }
          }
        }
      }

      // if(this.globals.unreadChats == 0) {
      //   this.userService.hideChatNotifications();
      // }
    }

    if(this.globals.userList.length) {
      for (var k in this.globals.userList) {
         if(this.globals.userList[k]._id[0]._id == messages.from) {
          this.globals.userList[k].chatCount = Math.max(parseInt(this.globals.userList[k].chatCount) - messages.chats.length, 0);
        }
      }
      this.globals.unreadChats = 0;
      for(var l in this.globals.userList) {
        if(this.globals.userList[l].chatCount) {
            this.globals.unreadChats += parseInt(this.globals.userList[l].chatCount);
        }
      }
    }
  }
 
  retainIdenticalMessages(messageList) {
    if(this.messageList.length) {
      for(var i in messageList) {
        for(var j in this.messageList) {
          if(JSON.stringify(messageList[i]) == JSON.stringify(this.messageList[j])) {
            messageList[i] = this.messageList[j];
            break;
          }
        }
      }
    }
    return messageList;
  }

  getMessage(user) {
    this.chatUser = user;
    this.message.to = user._id;
    this.chatText = '';
    this.messageList = [];
    this.socket.emit('msgGetting', this.message);
    setTimeout(() => {
      if(this.chatinput) {
        let  textArea = this.chatinput.nativeElement; 
        this.textAreaInitialHeight = textArea.offsetHeight;
        this.textAreaPadding = textArea.offsetHeight - textArea.scrollHeight;
        this.displayWidth = this.chatMessageArea.nativeElement.offsetWidth; 
        this.videoWidth = this.displayWidth * this.mediaAspectRatio;
      }
    });

  }

  parseMessage(text, isMyMsg, msgIndex, created) {

    return {'data': text, 'isMyMsg': isMyMsg, 'msgIndex': msgIndex, 'created': created};
    
  }

  sendMessage(data) {

    if(data.length) {

      this.message._id = null;
      this.message.data = data;
      this.chatText = '';
      this.backtoNormalHeight();
      this.focusOnKeyboard();
      
      var message = JSON.parse(JSON.stringify(this.message));
      this.messageList.push(message);
      this.canScrollToBottom = true;
      this.socket.emit('msgSending', message);
        
    }
  }

  onFocusKeyboard() {
    // this.toggled = false;
    // this.content.resize();
    this.canScrollToBottom = true;
  }

  focusOnKeyboard() {
    this.chatinput.nativeElement.focus();
  }

  sendTypingNotification($event) {
    this.socket.emit('onTyping', {to: this.message.to, from: this.message.from});
  }

}
