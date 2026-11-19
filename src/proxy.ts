import { NextResponse } from "next/server";
import { auth } from "../auth";


export default auth((req) => {
//     const isLoggedIn = !!req.auth
//     const isOnProduct = req.nextUrl.pathname.startsWith("/u")

//    if (isOnProduct && !isLoggedIn) {
//         const loginUrl = new URL("/login", req.nextUrl.origin)
//         return NextResponse.redirect(loginUrl)
//     }
})

export const config = {
    // Run on all routes except static files and API routes
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}