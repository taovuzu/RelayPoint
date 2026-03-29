import { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setPageTitle } from '@/redux/app';
import { useWorkflows } from '@/features/workflow-management/api/workflow.queries';
import { WorkflowGrid } from '@/features/workflow-management/ui/WorkflowGrid';
import { WorkflowFilters } from '@/features/workflow-management/ui/WorkflowFilters';
import {
  applyFilters,
  STATUS_OPTIONS,
  SORT_OPTIONS,
} from '@/features/workflow-management/model/workflow.filters';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/pagination';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';

export default function WorkflowListPage() {
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const limit = 10;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(STATUS_OPTIONS.ALL);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NEWEST);

  const { workflows, pagination, isLoading } = useWorkflows({ page, limit });

  useEffect(() => {
    dispatch(setPageTitle('Workflows'));
  }, [dispatch]);

  const filteredWorkflows = useMemo(
    () => applyFilters(workflows, { search, status: statusFilter, sortBy }),
    [workflows, search, statusFilter, sortBy]
  );

  const totalPages = Math.ceil((pagination?.total || 0) / limit);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and monitor your automation workflows.
          </p>
        </div>
        <Button asChild>
          <Link to="/workflows/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Workflow
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <WorkflowFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Grid */}
      <WorkflowGrid workflows={filteredWorkflows} isLoading={isLoading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={pageNum === page}
                    onClick={() => setPage(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

