import { authClient } from "@bmhkms/client/auth-client";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { AlertCircleIcon, LockIcon, MailIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

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
  const router = useRouter();
  const { error } = Route.useSearch();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningInWithMicrosoft, setIsSigningInWithMicrosoft] =
    useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setAuthError(null);

      const { error: signInError } = await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            void router.navigate({ to: "/" });
          },
        }
      );

      if (!signInError) {
        return;
      }

      if (signInError.code === "INVALID_USERNAME_OR_PASSWORD") {
        setAuthError("Invalid username or password.");
        return;
      }

      if (signInError.code === "EMAIL_NOT_VERIFIED") {
        setAuthError("This account cannot sign in yet.");
        return;
      }

      setAuthError("Sign in failed. Please try again.");
    },
  });

  let routeError: string | null = null;

  if (error === "signup_disabled" || error === "access_denied") {
    routeError = "Microsoft sign-in failed.";
  } else if (error) {
    routeError = "Sign in failed.";
  }
  const activeError = authError ?? routeError;

  async function signIn() {
    setAuthError(null);
    setIsSigningInWithMicrosoft(true);

    try {
      const { error: signInError } = await authClient.signIn.social({
        callbackURL: "/",
        errorCallbackURL: "/login",
        provider: "microsoft",
      });

      if (signInError) {
        setAuthError("Microsoft sign-in failed.");
        setIsSigningInWithMicrosoft(false);
      }
    } catch {
      setAuthError("Microsoft sign-in failed.");
      setIsSigningInWithMicrosoft(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Staff Sign in</CardTitle>
          <CardDescription>
            Continue with Microsoft or sign in with your email and password.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {activeError ? (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Unable to sign in</AlertTitle>
              <AlertDescription>{activeError}</AlertDescription>
            </Alert>
          ) : null}
          <Button
            className="w-full"
            disabled={isSigningInWithMicrosoft || form.state.isSubmitting}
            onClick={signIn}
            type="button"
            variant="outline"
          >
            {isSigningInWithMicrosoft ? (
              <>
                <Spinner data-icon="inline-start" />
                Redirecting...
              </>
            ) : (
              "Sign in with Microsoft"
            )}
          </Button>
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <FieldSet>
              <FieldLegend className="sr-only">Email and password</FieldLegend>
              <FieldGroup>
                <form.Field
                  name="email"
                  validators={{
                    onBlur: ({ value }) => {
                      const result = loginSchema.shape.email.safeParse(value);
                      return result.success
                        ? undefined
                        : result.error.issues[0]?.message;
                    },
                    onSubmit: ({ value }) => {
                      const result = loginSchema.shape.email.safeParse(value);
                      return result.success
                        ? undefined
                        : result.error.issues[0]?.message;
                    },
                  }}
                >
                  {(field) => (
                    <Field
                      data-invalid={
                        field.state.meta.errors.length > 0 || undefined
                      }
                    >
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <div className="relative">
                        <MailIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          aria-invalid={field.state.meta.errors.length > 0}
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          className="pl-8"
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            setAuthError(null);
                            field.handleChange(event.target.value);
                          }}
                          placeholder="dev-admin+bmhk-local-dev@kmutt.ac.th"
                          type="email"
                          value={field.state.value}
                        />
                      </div>
                      <FieldError>{field.state.meta.errors[0]}</FieldError>
                    </Field>
                  )}
                </form.Field>
                <form.Field
                  name="password"
                  validators={{
                    onBlur: ({ value }) => {
                      const result =
                        loginSchema.shape.password.safeParse(value);
                      return result.success
                        ? undefined
                        : result.error.issues[0]?.message;
                    },
                    onSubmit: ({ value }) => {
                      const result =
                        loginSchema.shape.password.safeParse(value);
                      return result.success
                        ? undefined
                        : result.error.issues[0]?.message;
                    },
                  }}
                >
                  {(field) => (
                    <Field
                      data-invalid={
                        field.state.meta.errors.length > 0 || undefined
                      }
                    >
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <div className="relative">
                        <LockIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          aria-invalid={field.state.meta.errors.length > 0}
                          autoComplete="current-password"
                          className="pl-8"
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            setAuthError(null);
                            field.handleChange(event.target.value);
                          }}
                          placeholder="Enter your password"
                          type="password"
                          value={field.state.value}
                        />
                      </div>
                      <FieldError>{field.state.meta.errors[0]}</FieldError>
                    </Field>
                  )}
                </form.Field>
                <form.Subscribe
                  selector={(state) => ({
                    canSubmit: state.canSubmit,
                    isSubmitting: state.isSubmitting,
                    values: state.values,
                  })}
                >
                  {({ canSubmit, isSubmitting, values }) => {
                    const isDisabled =
                      isSigningInWithMicrosoft ||
                      isSubmitting ||
                      !canSubmit ||
                      values.email.trim().length === 0 ||
                      values.password.length === 0;

                    return (
                      <Button
                        className="w-full"
                        disabled={isDisabled}
                        type="submit"
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner data-icon="inline-start" />
                            Signing in...
                          </>
                        ) : (
                          "Sign in"
                        )}
                      </Button>
                    );
                  }}
                </form.Subscribe>
              </FieldGroup>
            </FieldSet>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
