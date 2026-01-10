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
  const [surname, setSurname] = useState('');
  const [givenName, setGivenName] = useState('');
  const [otherName, setOtherName] = useState('');
  const { addSearch, isSearching } = useSearch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surname.trim() || !givenName.trim()) return;
    
    await addSearch({ surname, givenName, otherName });
    setSurname('');
    setGivenName('');
    setOtherName('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <div className="space-y-2">
            <Label htmlFor="surname">Surname *</Label>
            <Input
              id="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Enter surname"
              required
              disabled={isSearching}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="givenName">Given Name *</Label>
            <Input
              id="givenName"
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
              placeholder="Enter given name"
              required
              disabled={isSearching}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="otherName">Other Name</Label>
            <Input
              id="otherName"
              value={otherName}
              onChange={(e) => setOtherName(e.target.value)}
              placeholder="Enter other name (optional)"
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
