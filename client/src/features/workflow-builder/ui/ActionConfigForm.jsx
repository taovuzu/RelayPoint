import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';


export function ActionConfigForm({ fields = [], values = {}, onChange }) {
  if (!fields.length) {
    return (
      <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-md border border-dashed">
        No configuration required for this node.
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {fields.map((field) => {
        const value = values[field.name] || '';

        switch (field.type) {
          case 'textarea':
            return (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={`config-${field.name}`}>{field.label}</Label>
                <Textarea
                  id={`config-${field.name}`}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  className="min-h-[100px] resize-y"
                />
              </div>
            );
            
          case 'text':
          default:
            return (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={`config-${field.name}`}>{field.label}</Label>
                <Input
                  id={`config-${field.name}`}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => onChange(field.name, e.target.value)}
                />
              </div>
            );
        }
      })}
    </div>
  );
}
