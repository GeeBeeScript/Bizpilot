
import LogoIcon from './LogoIcon'
import LogoText from './LogoText'

const Logo = ({ className }: { className: string }) => {
  return (
    <div className='flex gap-1 items-center'>
      <LogoIcon />
      <LogoText className={className} />
    </div>
  )
}

export default Logo