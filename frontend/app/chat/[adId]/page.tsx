"use client";

import { useEffect,useState } from "react";
import { socket } from "../../../lib/socket";
import { api } from "../../../lib/api";
import { useParams } from "next/navigation";

export default function ChatPage(){

  const { adId } = useParams();

  const [messages,setMessages] = useState<any[]>([]);
  const [text,setText] = useState("");

  /* LOAD OLD MESSAGES */

  const loadMessages = async()=>{

    const res = await api.get(`/chat/${adId}`);

    setMessages(res.data);

  };

  useEffect(()=>{

    loadMessages();

    socket.emit("joinRoom",adId);

    socket.on("receiveMessage",(msg)=>{

      setMessages(prev=>[...prev,msg]);

    });

  },[]);

  /* SEND MESSAGE */

  const sendMessage = ()=>{

    if(!text) return;

    socket.emit("sendMessage",{

      adId,
      message:text

    });

    setText("");

  };

  return(

    <div className="max-w-2xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">

        Live Chat

      </h1>

      {/* MESSAGES */}

      <div className="border p-4 h-96 overflow-y-auto mb-4">

        {messages.map((msg,index)=>(

          <div key={index} className="mb-2">

            <span className="bg-gray-200 px-3 py-1 rounded">

              {msg.message}

            </span>

          </div>

        ))}

      </div>

      {/* INPUT */}

      <div className="flex gap-2">

        <input
        value={text}
        onChange={(e)=>setText(e.target.value)}
        className="flex-1 border px-3 py-2"
        placeholder="Type message"
        />

        <button
        onClick={sendMessage}
        className="bg-blue-600 text-white px-4"
        >
          Send
        </button>

      </div>

    </div>

  );

}
