import { useRouter } from "next/router"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

function prettyProvider(name?: string) {
  if (!name) return undefined
  const lower = name.toLowerCase()
  switch (lower) {
    case "google":
      return "Google"
    case "credentials":
      return "Email & Password"
    default:
      return name.charAt(0).toUpperCase() + name.slice(1)
  }
}

function getErrorMessage(error?: string, provider?: string) {
  const providerLabel = prettyProvider(provider)
  switch (error) {
    case "AccessDenied":
      return {
        title: "Sign-in Not Allowed",
        description: "Your account is not allowed to sign in with this provider.",
        hint:
          providerLabel === "Google"
            ? "Google sign-in is available for Customer accounts only. Admin, Operations, Farmer, and Driver must use email and password."
            : "This provider is restricted for your account. Please use email and password to sign in.",
      }
    case "CredentialsSignin":
      return {
        title: "Invalid Credentials",
        description: "The email or password you entered is incorrect.",
        hint: "Please double-check your credentials or reset your password.",
      }
    case "OAuthAccountNotLinked":
      return {
        title: "Account Not Linked",
        description: "This email is linked to a different sign-in method.",
        hint:
          providerLabel
            ? `Sign in using your original method (not ${providerLabel}), or link providers from your account settings.`
            : "Sign in using your original method, or link providers from your account settings.",
      }
    case "SessionRequired":
      return {
        title: "Sign-in Required",
        description: "You need to sign in to access this page.",
        hint: "Please sign in and try again.",
      }
    case "Configuration":
      return {
        title: "Auth Configuration Issue",
        description: "Authentication is not properly configured.",
        hint: "Please try again later or contact support.",
      }
    case "Verification":
      return {
        title: "Verification Error",
        description: "Your verification link is invalid or expired.",
        hint: "Request a new sign-in link or use your password.",
      }
    case "Callback":
      return {
        title: "Sign-in Error",
        description: "Something went wrong during sign-in.",
        hint: "Please try again. If the problem persists, contact support.",
      }
    default:
      return {
        title: "Sign-in Error",
        description: "We couldn't complete your sign-in.",
        hint: "Please try again or use a different method.",
      }
  }
}

export default function AuthErrorPage() {
  const router = useRouter()
  const { error, callbackUrl, provider, role } = router.query
  const details = getErrorMessage(typeof error === "string" ? error : undefined, typeof provider === "string" ? provider : undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{details.title}</CardTitle>
          <CardDescription className="text-center">{details.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900 text-sm">
              {details.hint}
            </AlertDescription>
          </Alert>

          {/* Role-specific guidance */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-800 mb-2">Guidance by role</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className={typeof role === "string" && role.toUpperCase() === "FARMER" ? "font-semibold" : ""}>
                Farmer: Use email & password. Contact your coordinator for provisioning.
              </li>
              <li className={typeof role === "string" && role.toUpperCase() === "DRIVER" ? "font-semibold" : ""}>
                Driver: Use email & password. Check dispatch for credentials or support.
              </li>
              <li className={typeof role === "string" && role.toUpperCase() === "ADMIN" ? "font-semibold" : ""}>
                Admin: Use email & password. Manage access in Admin panel.
              </li>
              <li className={typeof role === "string" && role.toUpperCase() === "OPERATIONS" ? "font-semibold" : ""}>
                Operations: Use email & password. Contact IT if you need a reset.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            {typeof callbackUrl === "string" && callbackUrl && (
              <Button asChild className="w-full bg-brand hover:bg-brand-700">
                <Link href={callbackUrl}>Return to where you left off</Link>
              </Button>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/signin">Back to Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/contact">Contact Support</Link>
            </Button>
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-brand hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}