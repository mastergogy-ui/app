'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'

export default function AdPage(){

  const { id } = useParams()
  const [ad,setAd] = useState<any>(null)

  useEffect(()=>{
    const loadAd = async()=>{
      try{
        const res = await api.get(`/ads/${id}`)
        setAd(res.data)
      }catch(e){
        console.log(e)
      }
    }

    loadAd()
  },[id])

  if(!ad) return <div>Loading...</div>

  return(
    <div>
      <h1>{ad.title}</h1>
      <p>{ad.description}</p>
    </div>
  )
}
