// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  let user = event.userInfo
  let roomInfo = await db.collection('Rooms').where({
    _id: event._id
  }).get()
  let iSGameStart = true
  roomInfo.data[0].players.forEach(item => {
    if (item.openId === user.openId) {
      item.ready = 1
      item.truth = event.truth
      item.brave = event.brave
    } else if (!item.ready) {
      iSGameStart = false
    }
  })

  let bExsit = await db.collection("Brave").where({
    text: event.brave
  }).get()
  if (bExsit.data.length == 0) {
    db.collection("Brave").add({
      data: {
        text: event.brave
      }
    }).catch(console.error)
  }
  let tExsit = await db.collection("Truth").where({
    text: event.truth
  }).get()
  if (tExsit.data.length == 0) {
    db.collection("Truth").add({
      data: {
        text: event.truth
      }
    }).catch(console.error)
  }

  return await db.collection('Rooms').where({
    _id: roomInfo.data[0]._id
  }).update({
    data: {
      players: roomInfo.data[0].players,
      gameStatus: iSGameStart ? 1 : 0,
      playerIndex: iSGameStart ? 0 : -1
    }
  }).catch(console.error)
}