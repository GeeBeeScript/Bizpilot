import { cookies } from "next/headers"
import "server-only"
import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import { cache } from "react"
import { authPaths, paths } from "@/app/paths"
import prisma from "@/lib/prisma"
import { ForbiddenError } from "@/lib/error"

export const requireMembership = cache(async () => {
    const session = await auth()
    const user = session?.user
    if (!user?.id) redirect(authPaths.loginPage())
    if (!user.activeOrgId || !user.role || !user.kind) redirect(paths.app.onboardingPage())
    return {
        userId: user.id,
        activeOrgId: user.activeOrgId,
        role: user.role,
        kind: user.kind
    }
})

export const requireFreshMembership = async () => {
    const memberData = await requireMembership()
    const membership = await prisma.membership.findUnique({
        where: { userId_orgId: { userId: memberData.userId, orgId: memberData.activeOrgId } },
        select: { role: true, status: true }
    })
    if (!membership || membership.status !== "active") throw new ForbiddenError()
    return { ...memberData, role: membership.role }
}