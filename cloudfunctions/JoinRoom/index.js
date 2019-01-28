// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  let user = event.userInfo
  let roomInfo = await db.collection('Rooms').where({
    roomNumber: event.roomNumber
  }).get()

  if (roomInfo.data.length === 0){
    return 'room is not exist'
  }
  else if (roomInfo.data[0].peopleCount === roomInfo.data[0].players.length) {
    return 'room is full'
  }

  roomInfo.data[0].players.push({
    openId: user.openId,
    nickName: event.nickName,
    avatarUrl: event.avatarUrl
  })

  await db.collection('Rooms').where({
    _id: roomInfo.data[0]._id
  }).update({
    data: {
      players: roomInfo.data[0].players
    }
  }).catch(console.error)

  return roomInfo 
}