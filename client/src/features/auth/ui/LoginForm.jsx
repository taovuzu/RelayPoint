import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";

import { loginSchema } from "@/features/auth/model/auth.schemas.js";
import { useLogin } from "@/features/auth/api/auth.mutations.js";

export function LoginForm({ className, ...props }) {
  const { mutate: loginWithCredentials, isLoading } = useLogin();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      await loginWithCredentials(values);
    } catch (err) {
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription>
            Login with your Google account or email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup className="gap-4">
                <Field>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() =>
                      (window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/google`)
                    }
                    className="w-full flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-4 shrink-0"
                    >
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with email
                </FieldSeparator>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel htmlFor="email">Email Address</FieldLabel>
                        <FormControl>
                          <Input
                            id="email"
                            placeholder="m@example.com"
                            required
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <div className="flex items-center">
                          <FieldLabel htmlFor="password">Password</FieldLabel>
                          <Link
                            to="/forgot-password"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                            tabIndex={isLoading ? -1 : 0}
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            required
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />

                <Field>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Login
                  </Button>
                  <FieldDescription className="text-center text-sm pt-4">
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/register"
                      className="font-semibold text-primary hover:underline"
                    >
                      Sign up
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <Link
          to="#"
          className="hover:text-foreground underline underline-offset-4"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          to="#"
          className="hover:text-foreground underline underline-offset-4"
        >
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
}

