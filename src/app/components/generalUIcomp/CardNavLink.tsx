import Link from 'next/link'
import React from 'react'
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';

type CardNavLinkProps = {
    href: string;
    buttonStyles?: string | null;
    children: React.ReactNode;
}

const CardNavLink = ({ href, buttonStyles, children }: CardNavLinkProps) => {
  return (
    <Link href={href} className={cn(buttonVariants({ variant: "ghost" }), "group/navlink px-2 py-1 text-center", buttonStyles)}>
        {children} <ChevronRight className='transition-transform duration-150 group-hover/navlink:translate-x-0.5' />
    </Link>
  )
}

export default CardNavLink
