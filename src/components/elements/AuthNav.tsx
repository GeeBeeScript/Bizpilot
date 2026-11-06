"use client";

import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Link from "next/link";

const AuthNavigation = () => {
  const pathName = usePathname();
  const isOnLoginPage = pathName.startsWith("/login");

  return (
    <nav className="w-full border-b border-b-ring">
      <ul className="max-w-300 mx-auto px-4 py-2 flex items-center justify-between">
        <li>
          <div>
            <Logo className="text-2xl rounded-md px-3 py-2 bg-gray-100 dark:bg-muted" />
          </div>
        </li>
        <li>
          {isOnLoginPage ? (
            <Link
              href="/signup"
              className="border border-chart-5 text-secondary-foreground sm:text-xl text-md rounded-md bg-transparent font-geist-mono px-2 md:px-4 py-2 mx-4 transition-all duration-100 ease-in-out hover:bg-gray-100 dark:hover:bg-muted"
            >
              Sign up
            </Link>
          ) : (
            <Link
              href="/login"
              className="border border-chart-5 text-secondary-foreground sm:text-xl text-md rounded-md bg-transparent font-geist-mono px-2 md:px-4 py-2 mx-4 transition-all duration-100 ease-in-out hover:bg-gray-100 dark:hover:bg-muted"
            >
              Login
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default AuthNavigation;
