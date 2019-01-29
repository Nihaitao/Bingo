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

  let players = []
  let myIndex = -1
  roomInfo.data[0].players.forEach((item,index) => {
    if (item.openId != user.openId) {
      players.push(item)
    }else{
      myIndex = index
    }
  })

  if (players.length > 0){
    if (event.gameState == 2){//准备阶段退出，剔除玩家，房间信息不变
      return await db.collection('Rooms').where({
        _id: roomInfo.data[0]._id
      }).update({
        data: {
          players: players
        }
      }).catch(console.error)
    } else if (event.gameState == 3) {//游戏阶段，剔除玩家，房间信息变更
      if (roomInfo.data[0].playerIndex == myIndex){//我的回合退出
        if (roomInfo.data[0].playerIndex == roomInfo.data[0].peopleCount - 1){//我是最后一位
          roomInfo.data[0].playerIndex = 0
        }
      }
      return await db.collection('Rooms').where({
        _id: roomInfo.data[0]._id
      }).update({
        data: {
          players: players,
          playerIndex: roomInfo.data[0].playerIndex,
          peopleCount: roomInfo.data[0].peopleCount - 1
        }
      }).catch(console.error)
    }
  }else{//玩家为0 删除房间
    return await db.collection('Rooms').where({
      _id: roomInfo.data[0]._id
    }).remove()
  }


}