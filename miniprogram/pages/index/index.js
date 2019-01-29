//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //点击头像
  bindViewTap: function () {
  },
  //Create
  bindCreate:function(){
    wx.navigateTo({
      url: '../room/room?playtype=1'
    })
  },
  //Join
  bindJoin: function () {    
    this.room.showDialog()    
  },
  joinFn:function(){
    let data = {
      nickName: app.globalData.userInfo.nickName,
      avatarUrl: app.globalData.userInfo.avatarUrl,
      roomNumber: this.room.data.room
    }
    console.log(data)
    wx.cloud.callFunction({
      name: 'JoinRoom',
      data: data
    }).then(res => {
      if (res.result) {
        if(res.result.data){
          wx.navigateTo({
            url: '../room/room?playtype=2&roomInfo=' + JSON.stringify(res.result.data[0])
          })
        }else{
          wx.showToast({
            title: res.result,
            icon:'none',
            duration: 2000
          })
        }
      }
    }).catch(res => {
      console.log(res)
    })
    //this.room.hideDialog()
  },

  onReady:function(){
    //获得dialog组件
    this.room = this.selectComponent("#room");
  },

  onShow: function () {
    if (this.room) {
      this.room.hideDialog()
    }
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  }
})
