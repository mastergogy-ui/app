"use client";

import Link from "next/link";

export default function Navbar(){

const unread = 3;

return(

```
<div className="w-full bg-white border-b px-6 py-4 flex justify-between items-center">

  <Link href="/">

    <h1 className="text-2xl font-bold text-blue-600">
      RentWala
    </h1>

  </Link>

  <div className="flex items-center gap-6">

    <Link href="/">
      Home
    </Link>

    <Link href="/post-ad"
    className="bg-red-600 text-white px-5 py-2 rounded-full"
    >
      + Post Ad
    </Link>

    <Link href="/inbox" className="relative">

      Inbox

      {unread > 0 && (

        <span
        className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
        >
          {unread}
        </span>

      )}

    </Link>

  </div>

</div>
```

);

}
