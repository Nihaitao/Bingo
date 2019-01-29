// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let roomInfo = await db.collection('Rooms').where({
    _id: event._id
  }).get()

  let index = Math.floor(Math.random() * roomInfo.data[0].players.length)

  let text = event.model == "Truth" ? roomInfo.data[0].players[index].truth : roomInfo.data[0].players[index].brave

  await db.collection('Rooms').where({
    _id: event._id
  }).update({
    data: {
      chooseType: event.model,
      trueOrBraveText: text
    }
  })

  return text
}