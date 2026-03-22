import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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

import { verifyOTPSchema } from "@/features/auth/model/auth.schemas.js";
import { useVerifyOTP } from "@/features/auth/api/auth.mutations.js";
import { selectRegistrationEmail, resetRegistration } from "@/redux/auth";
import { resendVerification } from "@/redux/auth";
import { toast } from "sonner";

export function OTPInput() {
  const email = useSelector(selectRegistrationEmail);
  const dispatch = useDispatch();
  const { mutate, isLoading } = useVerifyOTP();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!email) {
      dispatch(resetRegistration());
    }
  }, [email, dispatch]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const form = useForm({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      await mutate({ email, otp: values.otp });
    } catch (err) {
      form.setError('otp', { message: err.message || 'Invalid OTP' });
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
       await dispatch(resendVerification(email)).unwrap();
       toast.success("New code sent to " + email);
       setCountdown(60);
    } catch (err) {
       toast.error(err.message || 'Failed to resend code');
    }
  };

  if (!email) return null;

  return (
    <div className="grid gap-6">
      <div className="text-center">
        <p className="text-sm text-balance text-muted-foreground">
          We've sent a 6-digit code to <br /><strong>{email}</strong>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
           <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="grid gap-2 items-center text-center">
                <FormLabel className="sr-only">One-Time Password</FormLabel>
                <FormControl>
                   <Input 
                      className="text-center tracking-widest font-mono text-2xl h-14 max-w-xs mx-auto" 
                      maxLength={6} 
                      placeholder="------" 
                      disabled={isLoading} 
                      {...field} 
                   />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
           />

           <Button type="submit" className="w-full" disabled={isLoading}>
             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Verify Code
           </Button>
        </form>
      </Form>

      <div className="text-center">
        <Button 
          variant="link" 
          onClick={handleResend} 
          disabled={countdown > 0 || isLoading}
          className="text-sm underline-offset-4"
        >
          {countdown > 0 ? `Resend Code (${countdown}s)` : 'Resend Code'}
        </Button>
      </div>
    </div>
  );
}

