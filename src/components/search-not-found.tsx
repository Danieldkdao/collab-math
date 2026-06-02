import { SearchXIcon } from "lucide-react";

export const SearchNotFound = ({ subject }: { subject: string }) => {
  return (
    <div className="w-full py-10 px-6 flex flex-col items-center justify-center gap-2 bg-card/50 rounded-md border-4 border-border border-dashed">
      <SearchXIcon className="size-10" />
      <h2 className="text-2xl font-semibold text-center">
        No <span className="capitalize">{subject}</span> Found
      </h2>
      <p className="text-lg text-muted-foreground max-w-150 text-center">
        We were unable to find any {subject} that match the current filters. Try
        adjusting the search terms or changing the filter options.
      </p>
    </div>
  );
};
