export type Role = "admin" | "owner" | "manager" | "member";

export type Kind = "internal" | "client";

export type Action = "create" | "read" | "update" | "delete";

export const permissions: Record<Role, Partial<Record<Kind, Action[]>>> = {
  admin: {
    internal: ["create", "read", "update", "delete"],
    client: ["read"],
  },
  owner: {
    internal: ["create", "read", "update", "delete"],
    client: ["create", "read", "update", "delete"],
  },
  manager: {
    internal: ["create", "read", "update", "delete"],
    client: ["create", "read", "update", "delete"],
  },
  member: {
    internal: ["read", "update", "delete"],
    client: ["read", "update"],
  },
};

export const can = (role: Role, kind: Kind, action: Action): boolean => {
    return ( 
        permissions[role]?.[kind]?.includes(action) ?? false
    )
}
