import { BuildingComplex } from 'lucide-react'
import React from 'react'

const LogoIcon = ({ className }: { className?: string }) => {
  return (
    <div className='py-2 px-1 rounded-sm bg-linear-to-r from-primary-blue via-blue-900 to-deep-sapphire'>
        <BuildingComplex color='#d8d4d4' className={className} />
      </div>
  )
}

export default LogoIcon