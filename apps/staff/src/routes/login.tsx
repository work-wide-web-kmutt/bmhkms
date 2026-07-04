import { authClient } from "@bmhkms/client/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (session) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { error?: string } => ({
    error: typeof search.error === "string" ? search.error : undefined,
  }),
});

function RouteComponent() {
  const { error } = Route.useSearch();
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function signIn() {
    setIsSigningIn(true);
    await authClient.signIn.social({
      callbackURL: window.location.origin,
      errorCallbackURL: `${window.location.origin}/login`,
      provider: "microsoft",
    });
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Staff Sign in</CardTitle>
          <CardDescription>Use your KMUTT account (@kmutt.ac.th)</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <p className="text-sm text-destructive">
              {error === "signup_disabled" || error === "access_denied"
                ? "Sign in failed. Only @kmutt.ac.th accounts are allowed."
                : `Sign in failed: ${error}`}
            </p>
          )}
          <Button className="w-full" disabled={isSigningIn} onClick={signIn}>
            {isSigningIn ? "Redirecting..." : "Sign in with KMUTT account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
