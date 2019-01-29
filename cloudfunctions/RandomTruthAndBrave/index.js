// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let truth = await db.collection('Truth').get()
  let brave = await db.collection('Brave').get()
  if (truth.data.length > 0 && brave.data.length > 0){
    let tIndex = Math.floor(Math.random() * truth.data.length)
    let bIndex = Math.floor(Math.random() * brave.data.length)
    return { Truth: truth.data[tIndex], Brave: brave.data[bIndex]}
  }else{
    return null
  }
}