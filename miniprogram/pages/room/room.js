// miniprogram/pages/room/room.js
const app = getApp()
let interval = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    playtype: 1,
    roomInfo: {},
    myReady: 0,
    playerIndex: 0,
    showBingo: false,
    truth:'有没有吃过鼻屎',
    brave:'发18元红包给后面第三位玩家',
    trueOrBraveTitle:'',
    trueOrBraveContent:'',
    chooseType:'',
    trueOrBraveText:''
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

  /**
   * 生命周期函数--onReady
   */
  onReady: function() {
    //获得dialog组件
    this.guess = this.selectComponent("#guess")
    this.truthOrBrave = this.selectComponent("#truthOrBrave")
    wx.cloud.callFunction({
      name: 'RandomTruthAndBrave',
    }).then(res => {
      if(res.result){
        this.setData({
          truth: res.result.Truth.text,
          brave: res.result.Brave.text
        })
      }
     }).catch(res => {
      console.log(res)
    })
  },

  /**
   * 生命周期函数--onShow
   */
  onShow: function() {
    console.log('show')    
  },
  /**
   * 生命周期函数--onHide
   */
  onHide: function() {
    console.log('hide')
  },
  /**
   * 生命周期函数--onUnload（后退事件）
   */
  onUnload: function() {
    console.log('onUnload')
    clearInterval(interval)
    if (this.data.playtype >= 2) { //游戏阶段
      wx.cloud.callFunction({
        name: 'LeaveRoom',
        data: {
          _id: this.data.roomInfo._id,
          gameState: this.data.playtype //2 准备阶段（退出房间） 3 游戏阶段 （退出房间，房间人数-1）
        }
      }).then(res => {}).catch(res => {
        console.log(res)
      })
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
    if (!this.data.truth || !this.data.truth.trim('')){
      wx.showToast({
        title: `pls set thr Truth`,
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (!this.data.brave || !this.data.brave.trim('')) {
      wx.showToast({
        title: `pls set the Brave`,
        icon: 'none',
        duration: 2000
      })
      return
    }
    let that = this
    wx.cloud.callFunction({
      name: 'BeReady',
      data: {
        _id: that.data.roomInfo._id,
        truth: that.data.truth,
        brave: that.data.brave
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
    interval = setInterval(() => {
      wx.cloud.callFunction({
        name: 'GetRoomInfo',
        data: {
          _id: that.data.roomInfo._id
        }
      }).then(res => {
        if (res.result) {
          console.log(res.result)
          if (that.data.roomInfo.players.length != res.result.data[0].players.length) { //人数变动，修改playerIndex
            res.result.data[0].players.forEach((item, index) => {
              if (item.nickName == app.globalData.userInfo.nickName && item.avatarUrl == app.globalData.userInfo.avatarUrl) {
                that.setData({
                  playerIndex: index
                })
              }
            })
          }


          that.setData({
            roomInfo: res.result.data[0]
          })
          //游戏逻辑
          if (that.data.roomInfo.gameStatus === 1) { //游戏进行中          
            that.setData({
              playtype: 3
            })
            // clearInterval(interval)//debug

          } else if (that.data.roomInfo.gameStatus === 2) { //游戏结束
            clearInterval(interval)

            that.setData({
              showBingo: true
            })
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
    let guessNumber = this.guess.data.guessNumber * 1
    let roomInfo = this.data.roomInfo
    if (roomInfo.low * 1 >= guessNumber || guessNumber >= roomInfo.high * 1) {
      wx.showToast({
        title: `pls input the number between ${roomInfo.low} and ${roomInfo.high}`,
        icon: 'none',
        duration: 2000
      })
    } else {
      if (guessNumber == roomInfo.bingo) {
        //游戏结束
        roomInfo.gameStatus = 2
        this.setData({
          showBingo: true
        })
      } else if (guessNumber < roomInfo.bingo) {
        roomInfo.low = guessNumber
      } else {
        roomInfo.high = guessNumber
      }
      wx.cloud.callFunction({
        name: 'GuessNumber',
        data: {
          _id: this.data.roomInfo._id,
          guessNumber: guessNumber
        }
      }).then(res => {
        if (res.result) {
          this.setData({
            roomInfo: roomInfo
          })
          this.guess.hideDialog()
        }
      }).catch(res => {
        console.log(res)
      })
    }
  },
  /**
   * 真心话
   */
  setTruth:function(){
    console.log("setTruth")
    this.setData({
      trueOrBraveTitle:"Truth",
      trueOrBraveContent:this.data.truth
    })
    this.truthOrBrave.showDialog()
  },
  /**
   * 大冒险
   */
  setBrave: function () {
    console.log("setBrave")
    this.setData({
      trueOrBraveTitle: "Brave",
      trueOrBraveContent: this.data.brave
    })
    this.truthOrBrave.showDialog()

  },
  yesFn:function(){
    if (this.truthOrBrave.data.title == "Truth") {
      this.setData({
        truth: this.truthOrBrave.data.textInfo
      })
    } else {
      this.setData({
        brave: this.truthOrBrave.data.textInfo
      })
    }
    this.truthOrBrave.hideDialog()
  },
  bindTruth:function(){
    if (this.data.chooseType){
      wx.showModal({
        title: 'Truth',
        content: this.data.trueOrBraveText,
        showCancel: false
      })
    }else{
      this.setData({
        chooseType: 'Truth'
      })
      wx.cloud.callFunction({
        name: 'GetTruthOrBrave',
        data: {
          _id: this.data.roomInfo._id,
          model: "Truth"
        }
      }).then(res => {
        if (res.result) {
          this.setData({
            trueOrBraveText: res.result
          })
          wx.showModal({
            title: 'Truth',
            content: res.result,
            showCancel: false
          })
        }
      }).catch(res => {
        console.log(res)
      })
    }
  },
  bindBrave: function () {
    if (this.data.chooseType) {
      wx.showModal({
        title: 'Brave',
        content: this.data.trueOrBraveText,
        showCancel: false
      })
    } else {
      this.setData({
        chooseType: 'Brave'
      })
      wx.cloud.callFunction({
        name: 'GetTruthOrBrave',
        data: {
          _id: this.data.roomInfo._id,
          model: "Brave"
        }
      }).then(res => {
        if (res.result) {
          this.setData({
            trueOrBraveText: res.result
          })
          wx.showModal({
            title: 'Brave',
            content: res.result,
            showCancel: false
          })
        }
      }).catch(res => {
        console.log(res)
      })
    }
  }
})