import { useState } from 'react';
import { getServiceMeta } from '@/entities/connection/lib/connection.utils';
import { formatRelativeTime } from '@/shared/lib/format';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ServiceIcon } from './ServiceIcon';
import { DeleteConnectionDialog } from './DeleteConnectionDialog';

export function ConnectionCard({ connection }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const meta = getServiceMeta(connection.service);

  return (
    <>
      <Card className="flex flex-col justify-between overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
              <ServiceIcon iconName={meta.icon} size={20} />
            </div>
            <div>
              <CardTitle className="text-base font-medium">{meta.label}</CardTitle>
              <p className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]" title={connection.accountIdentifier}>
                {connection.accountIdentifier || 'Not authenticated'}
              </p>
            </div>
          </div>
          <Badge variant={connection.isActive ? 'default' : 'secondary'} className={connection.isActive ? 'bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20' : ''}>
            {connection.isActive ? 'Active' : 'Disconnected'}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <span className="text-xs">Last used:</span>
              <span className="font-medium">{connection.lastUsedAt ? formatRelativeTime(connection.lastUsedAt) : 'Never'}</span>
            </div>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-muted-foreground hover:text-destructive transition-colors text-sm font-medium focus:outline-none"
            >
              Delete
            </button>
          </div>
        </CardContent>
      </Card>

      <DeleteConnectionDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        connectionId={connection.id}
        connectionName={meta.label}
      />
    </>
  );
}

