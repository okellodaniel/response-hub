import AddSearchDialog from '@/components/AddSearchDialog';
import SearchTable from '@/components/SearchTable';
import RecordDetailsSheet from '@/components/RecordDetailsSheet';

const Searches = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Searches</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all your API search records
          </p>
        </div>
        <AddSearchDialog />
      </div>

      <SearchTable />
      <RecordDetailsSheet />
    </div>
  );
};

export default Searches;
