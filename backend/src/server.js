import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

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

const PORT = process.env.PORT || 5000;

server.listen(PORT,()=>{

console.log(`Server running on ${PORT}`);

});
