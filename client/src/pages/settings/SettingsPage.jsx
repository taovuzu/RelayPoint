import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle, selectTheme, setTheme } from '@/redux/app';
import { ProfileSection } from '@/features/settings/ui/ProfileSection';
import { ChangePasswordForm } from '@/features/settings/ui/ChangePasswordForm';
import { Separator } from '@/shared/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Switch } from '@/shared/ui/switch';
import { Palette, Bell, Shield, User } from 'lucide-react';
import { toast } from 'sonner';


export default function SettingsPage() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  useEffect(() => {
    dispatch(setPageTitle('Account Settings'));
  }, [dispatch]);

  const handleSaveNotifications = () => {
    toast.success("Notification preferences updated successfully");
  };

  return (
    <div className="mx-auto max-w-4xl py-8 space-y-8 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and security.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="profile" className="flex items-center gap-2"><User className="h-4 w-4" /> <span className="hidden sm:inline">Profile</span></TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2"><Palette className="h-4 w-4" /> <span className="hidden sm:inline">Appearance</span></TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2"><Shield className="h-4 w-4" /> <span className="hidden sm:inline">Security</span></TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2"><Bell className="h-4 w-4" /> <span className="hidden sm:inline">Notifications</span></TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 pt-4 animate-in fade-in-50">
          <ProfileSection />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 pt-4 animate-in fade-in-50">
          <Card className="border-border/50 bg-card/50 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Theme Preferences</CardTitle>
              <CardDescription>Customize the interface theme. Select system to follow your OS settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <Select value={theme} onValueChange={(t) => dispatch(setTheme(t))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 pt-4 animate-in fade-in-50">
          <ChangePasswordForm />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 pt-4 animate-in fade-in-50">
          <Card className="border-border/50 bg-card/50 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what alerts you want to receive via email or system toasts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium leading-none">Workflow Execution Failures</span>
                  <span className="text-sm text-muted-foreground">Receive an email if any active workflow fails to execute.</span>
                </div>
                <Switch defaultChecked onCheckedChange={handleSaveNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium leading-none">Successful Workflow Runs</span>
                  <span className="text-sm text-muted-foreground">Receive a daily digest of all successfully executed workflows.</span>
                </div>
                <Switch onCheckedChange={handleSaveNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium leading-none">Security Alerts</span>
                  <span className="text-sm text-muted-foreground">Get notified about new logins from unrecognized devices.</span>
                </div>
                <Switch defaultChecked onCheckedChange={handleSaveNotifications} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
