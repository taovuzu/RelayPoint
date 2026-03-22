import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

import { resetPasswordSchema } from "@/features/auth/model/auth.schemas.js";
import { useResetPassword } from "@/features/auth/api/auth.mutations.js";

export function ResetPasswordForm() {
  const { mutate, isLoading } = useResetPassword();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      await mutate(values.newPassword);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        toast.error("Recovery link expired or invalid.");
        navigate('/forgot-password');
      }
    }
  };

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter new password" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm your new password" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </Form>
    </div>
  );
}

