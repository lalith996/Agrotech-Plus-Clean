import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials")
      } else {
        const session = await getSession()
        if (session?.user?.role === "CUSTOMER") {
          router.push("/dashboard")
        } else if (session?.user?.role === "FARMER") {
          router.push("/farmer/dashboard")
        } else if (session?.user?.role === "ADMIN" || session?.user?.role === "OPERATIONS") {
          router.push("/admin/dashboard")
        } else {
          router.push("/")
        }
      }
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("google", { redirect: false, callbackUrl: "/dashboard" });
      if (!result || result.error || result.ok === false) {
        setError("Google sign-in is only allowed for Customer accounts.");
      } else if (result.url) {
        router.push(result.url);
      }
    } catch (e) {
      setError("Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign in to AgroTrack+</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {router.query.message && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-900 text-sm">
                {String(router.query.message)}
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-gray-600">
                Enter your email address (personal or system-generated)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            <div className="flex items-center justify-between">
              <Link href="/auth/forgot-password" className="text-sm text-green-600 hover:text-green-500">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 text-center mb-2">
            Google sign-in is available for Customer accounts only. Admin, Operations, Farmer, and Driver must use email and password.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            Sign in with Google
          </Button>
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/auth/signup" className="text-green-600 hover:text-green-500">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}