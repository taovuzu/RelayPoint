import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '../model/settings.schemas';
import { useChangePassword } from '../api/settings.mutations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { KeyRound, Loader2, ShieldAlert } from 'lucide-react';


export function ChangePasswordForm() {
  const { mutate, isLoading, error } = useChangePassword();

  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await mutate(values, () => form.reset());
    } catch (err) {
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Change Password</CardTitle>
        </div>
        <CardDescription>
          Rotate your account credentials to keep your automations secure.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form id="change-password-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <p>{error?.response?.data?.message || error.message || 'Failed to update password'}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter current password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter new password" {...field} />
                  </FormControl>
                  <p className="text-[13px] text-muted-foreground mt-1.5">
                    Must be at least 8 characters, including uppercase, lowercase, numbers & symbols.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Re-enter new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>

      <CardFooter className="bg-muted/20 border-t px-6 py-4">
        <Button 
          type="submit" 
          form="change-password-form" 
          disabled={isLoading || !form.formState.isDirty}
          className="w-full sm:w-auto"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Password
        </Button>
      </CardFooter>
    </Card>
  );
}
