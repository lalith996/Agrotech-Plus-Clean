import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { UserRole } from "@prisma/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface WithAuthProps {
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { requiredRoles, redirectTo = "/auth/signin" }: WithAuthProps = {}
) {
  return function WithAuthWrapper(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "loading") return;

      if (!session) {
        router.replace(redirectTo);
        return;
      }

      if (requiredRoles && !requiredRoles.includes(session.user.role as UserRole)) {
        router.replace("/403");
      }
    }, [session, status, router, requiredRoles, redirectTo]);

    if (status === "loading") {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (!session || (requiredRoles && !requiredRoles.includes(session.user.role as UserRole))) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}