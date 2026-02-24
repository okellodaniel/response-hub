import AddGeneralNewsDialog from '@/components/AddGeneralNewsDialog';
import GeneralNewsTable from '@/components/GeneralNewsTable';
import GeneralNewsDetailsSheet from '@/components/GeneralNewsDetailsSheet';

const GeneralNews = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">General News</h1>
          <p className="text-muted-foreground mt-1">
            Search and view general news records
          </p>
        </div>
        <AddGeneralNewsDialog />
      </div>

      <GeneralNewsTable />
      <GeneralNewsDetailsSheet />
    </div>
  );
};

export default GeneralNews;
