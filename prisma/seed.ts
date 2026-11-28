import "dotenv/config"
import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import type { Roles } from "@/app/generated/prisma/client"
import { people } from "@/lib/mock/people"

const env = (name: string): string => {
    const value = process.env[name]
    if (!value) throw new Error(`Seed missing: ${value} from .env`)
    return value
}

const DIRECT_URL = env("DIRECT_URL")
const OWNER_EMAIL = env("SEED_OWNER_EMAIL")
const ALLOWED_DB_USER = env("SEED_ALLOWED_DB_USER")

const dbUser = decodeURIComponent(new URL(DIRECT_URL).username)

if (dbUser !== ALLOWED_DB_USER) {
    throw new Error(`ALLOWED DB_USER and ${dbUser} do not match`)
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DIRECT_URL }) })

const ORG = {
    cornucopia: "seed_org_cornucopia",
    labs: "seed_org_labs",
    outsider: "seed_org_outsider"
} as const 

const seedUserId = (key: string) => `seed_user_${key}`

const cornucopiaStaff: Record<string, Roles> = {
    sarah: "admin",
    james: "admin",
    priya: "manager",
    maya: "manager",
    alex: "member",
    daniel: "member",
    tom: "member"
}

const membership = (userId: string, orgId: string, role: Roles) => ({
    userId,
    orgId,
    role,
    kind: "internal" as const,
    status: "active" as const,
})

const main = async () => {
    await prisma.$transaction(async (tx) => {
        await tx.organization.deleteMany({ where: { id: { in: Object.values(ORG) } } })
        await tx.user.deleteMany({ where: { id: { startsWith: "seed_" } } })

        await tx.user.createMany({
            data: [
                ...Object.keys(cornucopiaStaff).map((key) => {
                    const p = people[key]
                    return { id: seedUserId(key), name: p.name, email: p.email!, initials: p.initials, isOnboardCompleted: true }
                }),
                { id: seedUserId("mitchel"), name: "Mitchel Sho", email: "mitchel@outsider.test", initials: "MS", isOnboardCompleted: true }
            ]
        })

        const me = await tx.user.upsert({
            where: { email: OWNER_EMAIL },
            update: { isOnboardCompleted: true },
            create: { email: OWNER_EMAIL, name: "Dev Owner", initials: "DO", isOnboardCompleted: true },
            select: { id: true }
        })

        await tx.organization.createMany({
            data: [
                {id: ORG.cornucopia, name: "The Cornucopia", initials: "TC", businessType: "Agency", businessSize: "11-50"},
                {id: ORG.labs, name: "Cornucopia Labs", initials: "CL", businessType: "Agency", businessSize: "1-10"},
                {id: ORG.outsider, name: "Outsider Studio", initials: "OS", businessType: "Agency", businessSize: "1-10"}
            ]
        })

        await tx.membership.createMany({
            data: [
                membership(me.id, ORG.cornucopia, "owner"),
                membership(me.id, ORG.labs, "member"),
                ...Object.entries(cornucopiaStaff).map(([key, role]) => membership(seedUserId(key), ORG.cornucopia, role)),
                membership(seedUserId("mitchel"), ORG.outsider, "owner")
            ]
        })

    }, { timeout: 20000 })
}

main().then(() => console.log("Seed complete")).catch((error) => {
    console.error(error)
    process.exitCode = 1
}).finally(() => prisma.$disconnect())