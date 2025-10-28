import { useEffect } from "react"
import { useRouter } from "next/router"
import { getSession } from "next-auth/react"
import { roleAccessControl } from "@/lib/role-access-control"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    async function run() {
      const session = await getSession()
      const role = session?.user?.role
      const destination = role ? roleAccessControl.getDashboardPath(role) : "/"
      router.replace(destination)
    }
    run()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mx-auto mb-3" />
        <p className="text-gray-600">Signing you in…</p>
      </div>
    </div>
  )
}