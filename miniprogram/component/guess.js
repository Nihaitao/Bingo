// component/guess.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    guessNumber: '',
    showModal: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hideDialog() {
      this.setData({
        showModal: false,
        guessNumber: ''
      })
    },
    //展示弹框
    showDialog() {
      this.setData({
        showModal: true
      })
    },
    _guessEvent() {
      //触发成功回调
      this.triggerEvent("guessEvent");
    },

    getGuessNumber(e) {
      this.setData({
        guessNumber:e.detail.value
      })
    }
  }
})