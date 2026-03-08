const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server,{
cors:{
origin:"*"
}
});

let chats = {};

io.on("connection",(socket)=>{

console.log("User connected");

socket.on("joinRoom",(adId)=>{

```
socket.join(adId);
```

});

socket.on("sendMessage",({adId,message})=>{

```
if(!chats[adId]){

  chats[adId] = [];

}

const msg = {
  message,
  time:Date.now()
};

chats[adId].push(msg);

io.to(adId).emit("receiveMessage",msg);
```

});

socket.on("typing",(adId)=>{

```
socket.to(adId).emit("typing");
```

});

socket.on("messageSeen",(adId)=>{

```
socket.to(adId).emit("seen");
```

});

});

app.get("/chat/:adId",(req,res)=>{

const { adId } = req.params;

res.json(chats[adId] || []);

});

server.listen(5000,()=>{

console.log("Server running on 5000");

});
