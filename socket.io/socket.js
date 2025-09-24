// socket.js

const SocketIO = require("socket.io");

module.exports = (server) => {
  // 소켓 서버를 열어준다.
  const io = SocketIO(server, { path: "/socket.io" });

  // 소켓 연결이 되었을 때
  io.on("connection", (socket) => {

    // "chat message" 리스너로 들어온 이벤트를 받는다.
    // msg value는 클라이언트에서 "chat message"이벤트로 송신한 값
    socket.on("chat message", (msg) => {

      // 클라이언트에서 들어온 msg를 io 객체에 보낸다.
      console.log(msg);
      io.emit("chat message", 're>'+msg);      
    });
  });
};