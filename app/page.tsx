'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser()

      if (data?.user) {
        router.replace('/create')
      } else {
        router.replace('/login')
      }
    }

    check()
  }, [router])

  return <div style={{ padding: '40px' }}>Carregando...</div>
}