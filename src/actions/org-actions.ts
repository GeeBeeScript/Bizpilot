"use server"

import { requireMembership } from "@/server/auth/session"
import z from "zod"
import { unstable_update } from "../../auth"
import { redirect } from "next/navigation"
import { paths } from "@/app/paths"

const orgIdSchema = z.string().min(1).max(64)

export const switchOrg = async (input: unknown): Promise<{ error: string } | void> => {
    const parsedSchema = orgIdSchema.safeParse(input)

    if (!parsedSchema.success) return { error: "Invalid organisation" }

    await requireMembership()

    const session = await unstable_update({ user: { activeOrgId: parsedSchema.data } })
    if (session?.user.activeOrgId !== parsedSchema.data) {
        return { error: "You do not have access to that organization" }
    }

    redirect(paths.product.productPage())
}