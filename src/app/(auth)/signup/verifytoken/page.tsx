import VerifyTokenPageComp from '@/components/pagecomponents/VerifyTokenPage'
import React from 'react'

export const metadata = { title: 'Verify your email' }

const VerifyTokenSignupPage = async ({ searchParams }: PageProps<'/signup/verifytoken'>) => {
  const { email } = await searchParams
  return (
    <section>
        <VerifyTokenPageComp email={typeof email === 'string' ? email : undefined} flow="signup" />
    </section>
  )
}

export default VerifyTokenSignupPage
