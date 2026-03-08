"use client";

import { useEffect,useState } from "react";
import { api } from "../../lib/api";
import Link from "next/link";

export default function InboxPage(){

const [conversations,setConversations] = useState<any[]>([]);

const loadInbox = async()=>{

```
try{

  const res = await api.get("/chat");

  setConversations(res.data || []);

}catch(err){

  console.log(err);

}
```

};

useEffect(()=>{

```
loadInbox();
```

},[]);

return(

```
<div className="max-w-2xl mx-auto p-6">

  <h1 className="text-2xl font-bold mb-6">
    Chats
  </h1>

  {conversations.map((chat,index)=>(

    <Link
    key={index}
    href={`/chat/${chat.adId}`}
    >

      <div className="border p-4 rounded mb-3 hover:bg-gray-50">

        <p className="font-semibold">
          {chat.title}
        </p>

        <p className="text-gray-500 text-sm">
          Last message: {chat.lastMessage}
        </p>

      </div>

    </Link>

  ))}

</div>
```

);

}
