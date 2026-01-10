import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '@/contexts/SearchContext';
import { format } from 'date-fns';

const RecordDetailsSheet = () => {
  const { selectedRecord, setSelectedRecord } = useSearch();

  if (!selectedRecord) return null;

  const statusColors = {
    pending: 'bg-warning text-warning-foreground',
    completed: 'bg-success text-success-foreground',
    error: 'bg-destructive text-destructive-foreground',
  };

  return (
    <Sheet open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Record Details</SheetTitle>
          <SheetDescription>
            Full information for this search record.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="p-4 bg-muted rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <Badge className={statusColors[selectedRecord.status]}>
                {selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Record ID</span>
              <span className="text-sm font-mono">{selectedRecord.id.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Created At</span>
              <span className="text-sm">
                {format(new Date(selectedRecord.createdAt), 'PPp')}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Search Parameters</h4>
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Surname</span>
                <p className="mt-1 font-medium">{selectedRecord.surname}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Given Name</span>
                <p className="mt-1 font-medium">{selectedRecord.givenName}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Other Name</span>
                <p className="mt-1 font-medium">{selectedRecord.otherName || '—'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">API Response</h4>
            <pre className="p-4 bg-sidebar text-sidebar-foreground rounded-lg text-sm overflow-x-auto">
{JSON.stringify({
  surname: selectedRecord.surname,
  givenName: selectedRecord.givenName,
  otherName: selectedRecord.otherName,
}, null, 2)}
            </pre>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RecordDetailsSheet;
