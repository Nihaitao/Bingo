// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let user = event.userInfo
  let roomInfo = await db.collection('Rooms').where({
    _id: event._id
  }).get()
  let data = roomInfo.data[0]

  if (event.guessNumber == data.bingo){
    data.gameStatus = 2
  } else {
    data.playerIndex = (data.playerIndex + 1) % data.peopleCount
    if (event.guessNumber * 1 > data.bingo * 1){
      data.high = event.guessNumber
    } else {
      data.low = event.guessNumber
    }
  }

  return await db.collection('Rooms').where({
    _id: roomInfo.data[0]._id
  }).update({
    data: {
      gameStatus: data.gameStatus,
      playerIndex: data.playerIndex,
      high: data.high,
      low: data.low,
    }
  }).catch(console.error)
}