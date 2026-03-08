"use client";

import { useEffect,useState } from "react";
import { useParams } from "next/navigation";
import { socket } from "../../../lib/socket";
import { api } from "../../../lib/api";

export default function ChatPage(){

const params = useParams();
const adId = params.adId as string;

const [messages,setMessages] = useState<any[]>([]);
const [text,setText] = useState("");
const [typing,setTyping] = useState(false);

const loadMessages = async()=>{

```
try{

  const res = await api.get(`/chat/${adId}`);

  setMessages(res.data || []);

}catch(err){

  console.log(err);

}
```

};

useEffect(()=>{

```
if(!adId) return;

loadMessages();

socket.emit("joinRoom",adId);

socket.on("receiveMessage",(msg)=>{

  setMessages(prev=>[...prev,msg]);

});

socket.on("typing",()=>{

  setTyping(true);

  setTimeout(()=>{

    setTyping(false);

  },1500);

});
```

},[adId]);

const sendMessage = ()=>{

```
if(!text) return;

socket.emit("sendMessage",{

  adId,
  message:text

});

setText("");
```

};

const handleTyping = (e:any)=>{

```
setText(e.target.value);

socket.emit("typing",adId);
```

};

return(

```
<div className="max-w-2xl mx-auto p-6">

  <h1 className="text-2xl font-bold mb-6">
    Live Chat
  </h1>

  <div className="border p-4 h-96 overflow-y-auto mb-4 bg-gray-50">

    {messages.map((msg,index)=>(

      <div key={index} className="mb-2">

        <span className="bg-white px-3 py-2 rounded shadow">

          {msg.message}

        </span>

      </div>

    ))}

    {typing && (

      <p className="text-gray-400 text-sm mt-2">
        User typing...
      </p>

    )}

  </div>

  <div className="flex gap-2">

    <input
      value={text}
      onChange={handleTyping}
      className="flex-1 border px-3 py-2 rounded"
      placeholder="Type message..."
    />

    <button
      onClick={sendMessage}
      className="bg-blue-600 text-white px-4 rounded"
    >
      Send
    </button>

  </div>

</div>
```

);

}
