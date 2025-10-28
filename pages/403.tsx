import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function ForbiddenPage() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
      <p className="text-lg text-gray-600 mb-8">
        You don&apos;t have permission to access this page.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Go Back
        </button>
        <Link
          href={session ? "/dashboard" : "/"}
          className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {session ? "Go to Dashboard" : "Go Home"}
        </Link>
      </div>
    </div>
  );
}