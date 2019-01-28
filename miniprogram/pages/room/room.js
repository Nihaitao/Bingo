// miniprogram/pages/room/room.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    playtype: 1,
    roomInfo: {},
    myReady: 0,
    playerIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.roomInfo) {
      let roomInfo = JSON.parse(options.roomInfo)
      this.setData({
        playtype: options.playtype,
        roomInfo: roomInfo,
        playerIndex: roomInfo.players.length - 1
      })
      this.beginToInterval()
    }
  },

  formSubmit: function(e) {
    let data = e.detail.value
    data.nickName = app.globalData.userInfo.nickName
    data.avatarUrl = app.globalData.userInfo.avatarUrl
    wx.cloud.callFunction({
      name: 'CreatRoom',
      data: data
    }).then(res => {
      if (res.result) {
        // console.log(res.result.data[0])
        this.setData({
          roomInfo: res.result.data[0],
          playtype: 2
        })
        this.beginToInterval()
      }
    }).catch(res => {
      console.log(res)
    })
  },

  beReady: function() {
    let that = this
    wx.cloud.callFunction({
      name: 'BeReady',
      data: {
        _id: that.data.roomInfo._id
      }
    }).then(res => {
      if (res.result) {
        let roomInfo = that.data.roomInfo
        roomInfo.players[that.data.playerIndex].ready = 1
        that.setData({
          roomInfo: roomInfo,
          myReady: 1
        })
      }
    }).catch(res => {
      console.log(res)
    })
  },

  /**
   * 轮询服务器
   */
  beginToInterval: function() {
    let that = this
    let interval = setInterval(() => {
      wx.cloud.callFunction({
        name: 'GetRoomInfo',
        data: {
          _id: that.data.roomInfo._id
        }
      }).then(res => {
        if (res.result) {
          that.setData({
            roomInfo: res.result.data[0]
          })
          //游戏逻辑
          if (that.data.roomInfo.gameStatus === 1) {//游戏进行中
            console.log("Game Start")
          }


        }
      }).catch(res => {
        console.log(res)
      })
    }, 5000)

  }
})