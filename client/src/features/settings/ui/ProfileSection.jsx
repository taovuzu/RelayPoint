import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { formatDate } from '@/shared/lib/format';
import { User, Mail, ShieldCheck, ShieldAlert, Calendar } from 'lucide-react';


export function ProfileSection() {
  const user = useSelector(selectCurrentUser);

  if (!user) return null;

  const initials = user.fullName
    ?.split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <Card className="border-border/50 bg-card/50 shadow-sm backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <Avatar className="h-16 w-16 border-2 border-border shadow-sm">
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1 flex-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {user.fullName || 'User Profile'}
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            Role: {user.role || 'Member'}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2">
        {/* Email Block */}
        <div className="flex flex-col gap-1.5 rounded-lg border bg-background/50 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Mail className="h-4 w-4" />
            Email Address
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium truncate">{user.email}</span>
            {user.isEmailVerified ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 shrink-0 gap-1 pr-2">
                <ShieldCheck className="h-3 w-3" /> Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shrink-0 gap-1 pr-2">
                <ShieldAlert className="h-3 w-3" /> Unverified
              </Badge>
            )}
          </div>
        </div>

        {/* Member Since Block */}
        <div className="flex flex-col gap-1.5 rounded-lg border bg-background/50 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            Member Since
          </div>
          <div className="flex items-center h-full">
            <span className="font-medium">
              {formatDate(user.createdAt, 'MMMM d, yyyy')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
