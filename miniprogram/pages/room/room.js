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

  onReady: function() {
    //获得dialog组件
    this.guess = this.selectComponent("#guess");
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
          console.log(res.result)
          that.setData({
            roomInfo: res.result.data[0]
          })
          //游戏逻辑
          if (that.data.roomInfo.gameStatus === 1) { //游戏进行中          
            that.setData({
              playtype: 3
            })
            clearInterval(interval)//debug

          } else if (that.data.roomInfo.gameStatus === 2) {//游戏结束

            clearInterval(interval)

          }
        }
      }).catch(res => {
        console.log(res)
      })
    }, 2000)
  },

  bingoFn: function() {
    this.guess.showDialog()
  },

  guessFn() {
    let guessNumber = this.guess.data.guessNumber
    let roomInfo = this.data.roomInfo
    if (guessNumber == roomInfo.bingo) {
      //游戏结束
      roomInfo.gameStatus = 2
    } else if (guessNumber < roomInfo.bingo) {
      roomInfo.low = guessNumber
    } else {
      roomInfo.hige = guessNumber
    }
    this.setData({
      roomInfo: roomInfo
    })
    wx.cloud.callFunction({
      name: 'GuessNumber',
      data: {
        _id: that.data.roomInfo._id,
        guessNumber: guessNumber
      }
    }).then(res => {
      if (res.result) {
        console.log(res.result)
      }
    }).catch(res => {
      console.log(res)
    })
  }
})