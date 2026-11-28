import { Viewer } from "@/types"
import { cache } from "react"
import { requireMembership } from "../auth/session"
import prisma from "@/lib/prisma"
import { ForbiddenError } from "@/lib/error"


const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]!.toUpperCase()).join("") || "?"

export const getViewer = cache( async(): Promise<Viewer> => {
    const m = await requireMembership()

    const [user, memberships] = await Promise.all([
        prisma.user.findUnique({
            where: { id: m.userId },
            select: { id: true, name: true, email: true, initials: true, avatarUrl: true, image: true },
        }),

        prisma.membership.findMany({
            where: { userId: m.userId, status: "active" },
            orderBy: [{ kind: "asc" }, { createdAt: "asc" }],
            select: { role: true, kind: true, org: { select: { id: true, name: true, initials: true } } },
        })
    ])

    if (!user) throw new ForbiddenError("Your account no longer exists")

    const orgs = memberships.map(({ org, role, kind }) => ({ ...org, role, kind }))
    const activeOrg = orgs.find((org) => org.id === m.activeOrgId)
    if (!activeOrg) throw new ForbiddenError("You no longer have access to this organization")
    
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            initials: user.initials ?? initialsOf(user.name),
            avatarUrl: user.avatarUrl ?? user.image ?? undefined
        },
        activeOrg,
        orgs,
    }
} )
