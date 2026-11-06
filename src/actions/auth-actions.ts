"use server"

import { signIn, signOut } from "../../auth";

export const googleSignIn = async () => {
    await signIn("google", {
        redirectTo: "/u/dashboard"
    })
}

export const signOutHandler = async () => {
    await signOut({ redirectTo: "/" })
}
