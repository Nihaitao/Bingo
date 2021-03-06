// component/truthOrBrave.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: { // 属性名
      type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '标题' // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    // 弹窗内容
    content: {
      type: String,
      value: '弹窗内容'
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    showModal:false,
    textInfo:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hideDialog() {
      this.setData({
        showModal: false,
      })
    },
    //展示弹框
    showDialog() {
      this.setData({
        showModal: true
      })
    },
    _yesEvent() {
      //触发成功回调
      this.triggerEvent("yesEvent");
    },

    getTextInfo(e) {
      this.setData({
        textInfo: e.detail.value
      })
    }
  }
})
