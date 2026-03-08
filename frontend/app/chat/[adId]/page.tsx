'use client'

import { useEffect,useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from "../../../lib/api";

export default function ChatPage(){

  const { adId } = useParams()
  const [messages,setMessages] = useState<any[]>([])

  useEffect(()=>{
    const loadMessages = async()=>{
      try{
        const res = await api.get(`/chat/${adId}`)
        setMessages(res.data || [])
      }catch(e){
        console.log(e)
      }
    }

    loadMessages()
  },[adId])

  return(
    <div>
      <h1>Chat</h1>

      {messages.map((m,i)=>(
        <div key={i}>{m.text}</div>
      ))}

    </div>
  )
}
