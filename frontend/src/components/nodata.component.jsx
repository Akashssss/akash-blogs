import React from 'react';
import { Inbox } from 'lucide-react';

export default function NoDataMessage({ message = "No data available", description = "Check back later or try exploring other stories." }) {
  return (
    <div className="text-center py-12 px-6 w-full rounded-2xl border border-dashed border-border bg-muted/20 my-6 flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
        <Inbox className="w-6 h-6" />
      </div>
      <p className="text-base font-semibold text-foreground">
        {message}
      </p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}
