import React from "react";

export default function Pagination({ page, setPage, totalPages }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-auto pt-4">
      <button
        disabled={page === 1}
        onClick={() => setPage((p) => p - 1)}
        className="cursor-pointer px-4 py-2.5 bg-[#2b2d31] border border-[#1e1f22] rounded-lg 
        font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#35373c] 
        hover:border-[#5865F2] transition-all shadow-sm"
      >
        Previous
      </button>
      <div className="flex items-center gap-2">
        <span className="text-[#99AAB5] text-sm font-medium">Page</span>
        <span
          className="text-white text-sm font-bold bg-[#1e1f22] px-3 py-1.5 rounded-md border 
        border-[#3f4147] shadow-inner"
        >
          {page}
        </span>
        <span className="text-[#99AAB5] text-sm font-medium">
          of {totalPages}
        </span>
      </div>
      <button
        disabled={page === totalPages}
        onClick={() => setPage((p) => p + 1)}
        className="cursor-pointer px-4 py-2.5 bg-[#2b2d31] border border-[#1e1f22] rounded-lg font-bold text-sm 
        disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#35373c] hover:border-[#5865F2] transition-all shadow-sm"
      >
        Next
      </button>
    </div>
  );
}
