// component/roomnumber.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    roomnumber: ['', '', '', '', ''],
    room: '12596',
    disabled: false,
    inputFocus: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hideDialog() {
      this.setData({
        showModal: false,
        roomnumber: ['', '', '', '', ''],
        disabled: true
      })
    },
    //展示弹框
    showDialog() {
      this.setData({
        showModal: true
      })
    },
    getFocus() {
      this.setData({
        inputFocus: true
      })
    },
    changeFocus(event) {
      let val = event.detail.value + ''
      let arr = val.split('')
      let newArr = ['', '', '', '', '']
      for (var i = 0; i < arr.length; i++) {
        newArr[i] = arr[i]
      }
      this.setData({
        roomnumber: newArr,
        disabled: true
      })
      if (arr.length === 5) {
        this.setData({
          room: val,
          disabled: false
        })
      }
    },


    _joinEvent() {
      //触发成功回调
      this.triggerEvent("joinEvent");
    }
  }
})