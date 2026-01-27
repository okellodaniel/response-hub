import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearch } from '@/contexts/SearchContext';
import LoadingSpinner from './LoadingSpinner';

const AddSearchDialog = () => {
  const [open, setOpen] = useState(false);
  const [names, setNames] = useState('');
  const [error, setError] = useState('');
  const { addSearch, isSearching } = useSearch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required field
    if (!names.trim()) {
      setError('Name is required');
      return;
    }

    await addSearch({ names });
    setNames('');
    setOpen(false);
  };

  // Reset error when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Search</DialogTitle>
          <DialogDescription>
            Enter the details to search for a person record.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md animate-fade-in">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="names">Name *</Label>
            <Input
              id="names"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder="Enter name (e.g., Truss Liz)"
              required
              disabled={isSearching}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSearching}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSearchDialog;
