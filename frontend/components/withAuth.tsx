"use client";

import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const { isLoggedIn } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
      if (!isLoggedIn) {
        router.push("/login");
      }
    }, [isLoggedIn, router]);

    return isLoggedIn ? <Component {...props} /> : null;
  };

  return AuthComponent;
};

export default withAuth; 