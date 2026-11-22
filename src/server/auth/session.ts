import { cookies } from "next/headers"
import "server-only"
import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import { cache } from "react"
import { authPaths, paths } from "@/app/paths"
import prisma from "@/lib/prisma"

export const requireMembership = cache(async () => {
    const session = await auth()
    if (!session?.user?.id) redirect(authPaths.loginPage())
    if (!session?.user.activeOrgId) redirect(paths.app.onboardingPage())
    return {
        userId: session.user.id,
        activeOrgId: session.user.activeOrgId,
        role: session.user.role,
        kind: session.user.kind
    }
})

export const requireFreshMembership = async () => {
    const memberData = await requireMembership()
    const membership = await prisma.membership.findUnique({
        where: { userId_orgId: { userId: memberData.userId, orgId: memberData.activeOrgId } },
        select: { role: true, status: true }
    })
    if (!membership || membership.status !== "active") throw new Error()
    return { ...memberData, role: membership.role }
}