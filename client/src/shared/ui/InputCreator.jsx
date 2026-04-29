import React from 'react';
import { useDynamicData } from '@/features/workflow-builder/hooks/useDynamicData';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { VariablePicker } from '@/features/workflow-builder/ui/VariablePicker';
import { Switch } from '@/shared/ui/switch';
import { Textarea } from '@/shared/ui/textarea';
export function InputCreator({ schema, appKey, stepId, onChange, values, disabled }) {
  const { key, label, type, required, options, source, variables, description } = schema;
  
  const dynamicDataKey = source?.type === 'query' && source.name === 'getDynamicData' 
    ? source.arguments?.find(a => a.name === 'key')?.value 
    : null;

  const { data, loading } = useDynamicData(appKey, dynamicDataKey, values);

  const value = values[key] ?? '';

  if (type === 'dropdown') {
    const dropdownOptions = options || data?.map(d => ({ label: d.name, value: d.value })) || [];
    
    return (
      <div className="space-y-1.5">
        <Label>{label}{required && ' *'}</Label>
        <Select value={value} onValueChange={v => onChange(key, v)} disabled={disabled || loading}>
          <SelectTrigger>
            <SelectValue placeholder={loading ? "Loading..." : "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {dropdownOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description && <p className="text-[10px] text-muted-foreground mt-1">{description}</p>}
      </div>
    );
  }

  if (type === 'string') {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>{label}{required && ' *'}</Label>
          {variables && (
            <VariablePicker 
              currentNodeId={stepId} 
              onSelect={v => onChange(key, value + v)} 
            />
          )}
        </div>
        <Input 
          value={value} 
          onChange={e => onChange(key, e.target.value)} 
          disabled={disabled}
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
        {description && <p className="text-[10px] text-muted-foreground mt-1">{description}</p>}
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>{label}{required && ' *'}</Label>
          {variables && (
            <VariablePicker 
              currentNodeId={stepId} 
              onSelect={v => onChange(key, value + v)} 
            />
          )}
        </div>
        <Textarea 
          value={value} 
          onChange={e => onChange(key, e.target.value)} 
          disabled={disabled}
          placeholder={`Enter ${label.toLowerCase()}...`}
          className="min-h-[80px]"
        />
        {description && <p className="text-[10px] text-muted-foreground mt-1">{description}</p>}
      </div>
    );
  }

  if (type === 'boolean') {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
        <div className="space-y-0.5">
          <Label className="text-sm">{label}</Label>
          {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
        </div>
        <Switch 
          checked={!!value} 
          onCheckedChange={checked => onChange(key, checked)}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className="text-sm text-red-500">
      Unsupported input type: {type}
    </div>
  );
}
