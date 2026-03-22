import { useState } from "react";
import { CheckCheckIcon, Loader2 } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Alert, AlertTitle, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

import { forgotPasswordSchema } from "@/features/auth/model/auth.schemas.js";
import { useForgotPassword } from "@/features/auth/api/auth.mutations.js";

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { mutate, isLoading } = useForgotPassword();

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      await mutate(values.email);
      setIsSubmitted(true);
    } catch (err) {
      // Error is handled globally or via toast
    }
  };

  if (isSubmitted) {
    return (
      <Alert className="border-green-600 text-green-600 dark:border-green-400 dark:text-green-400">
        <CheckCheckIcon className="h-4 w-4" color="currentColor" />
        <AlertTitle>Reset link sent</AlertTitle>
        <AlertDescription>
          If an account exists with that email address, a password reset link
          has been sent. Please check your inbox.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="m@example.com"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Request Reset Link
          </Button>
        </form>
      </Form>
    </div>
  );
}
