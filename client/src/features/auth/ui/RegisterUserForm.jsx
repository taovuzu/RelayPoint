import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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

import { registerUserSchema } from "@/features/auth/model/auth.schemas.js";
import { useRegisterUser } from "@/features/auth/api/auth.mutations.js";

export function RegisterUserForm() {
  const { mutate, isLoading } = useRegisterUser();

  const form = useForm({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      await mutate({ 
        fullName: values.fullName, 
        password: values.password 
      });
    } catch (err) {
      if (err.validationErrors) {
        err.validationErrors.forEach(error => {
          form.setError(error.field, { message: error.message });
        });
      }
    }
  };

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Create a strong password" disabled={isLoading} {...field} />
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
                  <Input type="password" placeholder="Confirm your password" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Setup
          </Button>
        </form>
      </Form>
    </div>
  );
}

