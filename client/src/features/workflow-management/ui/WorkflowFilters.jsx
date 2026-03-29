import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { STATUS_OPTIONS, SORT_OPTIONS } from '../model/workflow.filters';
import { Search, ArrowUpDown } from 'lucide-react';

export function WorkflowFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="workflow-search"
          placeholder="Search workflows..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger id="workflow-status-filter" className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={STATUS_OPTIONS.ALL}>All Status</SelectItem>
            <SelectItem value={STATUS_OPTIONS.ACTIVE}>Active</SelectItem>
            <SelectItem value={STATUS_OPTIONS.INACTIVE}>Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger id="workflow-sort" className="w-[150px]">
            <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SORT_OPTIONS.NEWEST}>Newest First</SelectItem>
            <SelectItem value={SORT_OPTIONS.OLDEST}>Oldest First</SelectItem>
            <SelectItem value={SORT_OPTIONS.NAME_ASC}>Name A-Z</SelectItem>
            <SelectItem value={SORT_OPTIONS.NAME_DESC}>Name Z-A</SelectItem>
            <SelectItem value={SORT_OPTIONS.MOST_RUNS}>Most Runs</SelectItem>
            <SelectItem value={SORT_OPTIONS.LAST_RUN}>Last Run</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
