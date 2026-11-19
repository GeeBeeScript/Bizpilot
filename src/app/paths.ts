
export const authPaths = {
    signupPage() {
        return "/signup"
    },
    signupVerifyToken () {
        return "/signup/verifytoken"
    },
    loginPage () {
        return "/login"
    },
    loginVerifyToken () {
        return "/login/verifytoken"
    },
    forgotPassword () {
        return "/forgot-password"
    },
    resetPassword () {
        return "/reset-password"
    }
}

export const productPaths = {
    productPage () {
        return "/u/dashboard"
    }
}

export const appPaths = {
    onboardingPage () {
        return "/onboarding"
    }
}

export const paths = {
    auth: authPaths,
    product: productPaths,
    app: appPaths,
}