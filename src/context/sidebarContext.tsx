"use client"

import React, { createContext, useCallback, useContext, useState } from "react"

import { SIDEBAR_COOKIE } from "@/lib/constants"
import { useMediaQuery } from "@/lib/hooks"

type sidebarContextType = {
    /** Effective expanded state for the current breakpoint (rail when false) */
    isOpen: boolean | null,
    toggleIsOpen: () => void;
    /** lg+ — the sidebar sits in the layout; below lg an expanded sidebar overlays content */
    isDesktop: boolean;
    /** Mobile slide-out navigation */
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<sidebarContextType | undefined>(undefined)

export const SidebarProvider = ({ children, defaultOpen = true }: { children: React.ReactNode, defaultOpen?: boolean }) => {
    // Desktop preference is persisted; tablet always starts as an icon rail so it doesn't cover content
    const [desktopOpen, setDesktopOpen] = useState(defaultOpen)
    const [tabletOpen, setTabletOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const isDesktop = useMediaQuery("(min-width: 1024px)", true)

    const toggleIsOpen = useCallback(() => {
        if (!isDesktop) return setTabletOpen(o => !o)
        const next = !desktopOpen
        setDesktopOpen(next)
        document.cookie = `${SIDEBAR_COOKIE}=${next ? "open" : "collapsed"}; path=/; max-age=31536000; samesite=lax`
    }, [isDesktop, desktopOpen])

    return (
        <SidebarContext.Provider value={{ isOpen: isDesktop ? desktopOpen : tabletOpen, toggleIsOpen, isDesktop, mobileOpen, setMobileOpen }}>
            {children}
        </SidebarContext.Provider>
    )
}

export const useSidebar = () => {
    const context = useContext(SidebarContext)

    if (!context) {
        throw new Error("Sidebar context must be used inside a SidebarProvider")
    }

    return context
}
