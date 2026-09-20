import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export default function LoadMoreDataBtn({ state, fetchDataFunc, additionalParam }) {
  if (state !== null && state?.results && state.totalDocs > state.results.length) {
    return (
      <div className="flex justify-center my-8 w-full">
        <Button
          variant="outline"
          onClick={() => {
            fetchDataFunc({ ...additionalParam, page: state.page + 1 });
          }}
          className="rounded-full px-6 py-2 border-border hover:bg-muted hover:border-purple/40 text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-2 transition-all duration-150"
        >
          <span>Load More Stories</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }
  return null;
}
