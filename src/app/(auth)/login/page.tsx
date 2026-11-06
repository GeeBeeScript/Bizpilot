import AuthNavigation from '@/components/elements/AuthNav'
import LoginSection from '@/components/elements/LoginSection'
import React from 'react'
import { auth } from '../../../../auth'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Sign in' }

const LoginPage = async () => {
  const session = await auth()

  if (session?.user) redirect("/u/dashboard")
    
  return (
    <section className='flex flex-col w-screen min-h-screen'>
        <AuthNavigation />
       <div className='bg-amber/5 font-noto font-bold flex-1 content-center overflow-y-auto py-6'>
        <LoginSection />
       </div>

    </section>
  )
}

export default LoginPage