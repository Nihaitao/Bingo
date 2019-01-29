// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  let user = event.userInfo
  let roomInfo = {
    roomNumber: getRandom(),
    peopleCount: event.peopleCount,
    maxNumber: event.maxNumber,
    bingo: Math.floor(Math.random() * (event.maxNumber - 1)) + 1,
    players: [{
      openId: user.openId,
      nickName: event.nickName,
      avatarUrl: event.avatarUrl
    }],
    high: event.maxNumber,
    low: 0
  }
  let res = await db.collection('Rooms').add({
    data: roomInfo
  }).catch(console.error)
  return await db.collection('Rooms').where({
    _id: res._id
  }).get()
}


function getRandom() {
  var result = Math.floor(Math.random() * 100000);
  if (result < 10) {
    return "0000" + result;
  } else if (result < 100) {
    return "000" + result;
  } else if (result < 1000) {
    return "00" + result;
  } else if (result < 10000) {
    return "0" + result;
  } else {
    return result.toString();
  }
}