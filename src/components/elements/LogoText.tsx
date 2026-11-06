import React from 'react'

const LogoText = ({ className }: { className: string }) => {
  return (
<div className={`${className} font-bold font-noto bg-linear-to-r from-primary-blue via-blue-900 to-deep-sapphire dark:from-[#9cc2ec] dark:via-info dark:to-primary-gold bg-clip-text text-transparent`}>BizPilot</div>  )
}

export default LogoText