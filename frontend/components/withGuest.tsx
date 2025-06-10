"use client";

import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const withGuest = <P extends object>(Component: React.ComponentType<P>) => {
  const GuestComponent = (props: P) => {
    const { isLoggedIn } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
      if (isLoggedIn) {
        router.push("/");
      }
    }, [isLoggedIn, router]);

    return !isLoggedIn ? <Component {...props} /> : null;
  };

  return GuestComponent;
};

export default withGuest; 