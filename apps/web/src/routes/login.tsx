import { authClient } from "@bmhkms/client/auth-client";
import { isDevelopment } from "@bmhkms/env/web";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            void router.navigate({ to: "/dashboard" });
          },
        }
      );

      if (!error) {
        return;
      }

      if (error.code === "INVALID_EMAIL_OR_PASSWORD") {
        toast.error("Invalid email or password.");
        return;
      }

      if (error.code === "EMAIL_NOT_VERIFIED") {
        toast.error("This account cannot sign in yet.");
        return;
      }

      toast.error("Sign in failed. Please try again.");
    },
  });

  if (!isDevelopment) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <Card className="h-80 w-full max-w-sm" />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Development login with email and password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
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
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    aria-invalid={field.state.meta.errors.length > 0}
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                    }}
                    placeholder="student-1@example.com"
                    type="email"
                    value={field.state.value}
                  />
                  {field.state.meta.errors[0] ? (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>
            <form.Field
              name="password"
              validators={{
                onBlur: ({ value }) => {
                  const result = loginSchema.shape.password.safeParse(value);
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
                onSubmit: ({ value }) => {
                  const result = loginSchema.shape.password.safeParse(value);
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Password</Label>
                  <Input
                    aria-invalid={field.state.meta.errors.length > 0}
                    autoComplete="current-password"
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                    }}
                    placeholder="Enter your password"
                    type="password"
                    value={field.state.value}
                  />
                  {field.state.meta.errors[0] ? (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
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
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                );
              }}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
