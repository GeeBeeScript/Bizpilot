import AuthNavigation from '@/components/elements/AuthNav'
import SignupSection from '@/components/elements/SignupSection'
import React from 'react'

export const metadata = { title: 'Sign up' }

const SignupPage = () => {
  return (
    <section className='flex flex-col w-screen min-h-screen'>
        <AuthNavigation />
       <div className='bg-amber/5 font-noto font-bold flex-1 content-center overflow-y-auto py-6'>
        <SignupSection />
       </div>

    </section>
  )
}

export default SignupPage