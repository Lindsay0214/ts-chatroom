import devServer from "./server/dev";
import prodServer from "./server/prod";
import express from "express";
// 從 socket.io 引入 Server API
import { Server } from 'socket.io'
// 把 http 連線方式做一個小改造，把 http 模塊從 http 引入
import http from 'http' 
import UserService from "./service/UserService";
import moment from 'moment';

const port = 3000;
const app = express();
// http 的方式把 server 建立起來
const server = http.createServer(app)
const io = new Server(server)
const userService = new UserService()

// 透過 on 方法知道用戶連進來，等於是透過後端發個通知告訴前端說連線 ok
io.on('connection', (socket) => {

  socket.emit('userID', socket.id)

  socket.on('join', ({ userName, roomName }: { userName: string, roomName: string }) => {
    const userData = userService.userDataInfoHandler(
      socket.id,
      userName,
      roomName
    )
    socket.join(userData.roomName)
    userService.addUser(userData)
    socket.broadcast.to(userData.roomName).emit('join', `${userName} 加入了 ${roomName} 聊天室`)
  })
  
  socket.on('chat', (message) => {  
    const time = moment.utc() 
    const userData = userService.getUser(socket.id)
    if (userData) {
      io.to(userData.roomName).emit('chat', { userData, message, time })
    }
  })

  socket.on('disconnect', () => {
    const userData = userService.getUser(socket.id)
    const userName = userData?.userName
    if (userName) socket.broadcast.to(userData.roomName).emit('leave', `${userData.userName} 離開 ${userData.roomName} 聊天室`)

    userService.removeUser(socket.id)
  })
})

// 執行 npm run dev 本地開發 or 執行 npm run start 部署後啟動線上伺服器
if (process.env.NODE_ENV === "development") {
  devServer(app);
} else {
  prodServer(app);
}

server.listen(port, () => {
  console.log(`The application is running on port ${port}.`);
});
