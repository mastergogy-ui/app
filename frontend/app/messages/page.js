"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function MessagesPage() {
  const [adId, setAdId] = useState("");
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  const loadMessages = async () => {
    const response = await api.get(`/messages/${adId}`);
    setMessages(response.data);
  };

  const sendMessage = async () => {
    await api.post("/messages", {
      ad: adId,
      fromUser: "demo-user-id",
      toUser: "demo-owner-id",
      content,
    });
    setContent("");
    loadMessages();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-3">
      <h1 className="text-xl font-semibold">Messages</h1>
      <input className="border p-2 w-full" placeholder="Ad ID" value={adId} onChange={(e) => setAdId(e.target.value)} />
      <button className="bg-slate-800 text-white px-4 py-2 rounded" onClick={loadMessages}>Load Thread</button>
      <div className="space-y-2">
        {messages.map((msg) => (
          <div key={msg._id} className="border p-2 rounded bg-white">{msg.content}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="border p-2 flex-1" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type message" />
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
