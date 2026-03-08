const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* HTTP SERVER */

const server = http.createServer(app);

/* SOCKET.IO */

const { Server } = require("socket.io");

const io = new Server(server,{
  cors:{
    origin:"*"
  }
});

/* CHAT STORAGE (temporary memory) */

let chats = {};

/* SOCKET CONNECTION */

io.on("connection",(socket)=>{

  console.log("User connected");

  socket.on("joinRoom",(adId)=>{

    socket.join(adId);

  });

  socket.on("sendMessage",({adId,message})=>{

    if(!chats[adId]){

      chats[adId] = [];

    }

    const msg = {
      message,
      time:Date.now()
    };

    chats[adId].push(msg);

    io.to(adId).emit("receiveMessage",msg);

  });

});

/* API FOR OLD MESSAGES */

app.get("/chat/:adId",(req,res)=>{

  const { adId } = req.params;

  res.json(chats[adId] || []);

});

/* START SERVER */

server.listen(5000,()=>{

  console.log("Server running");

});
