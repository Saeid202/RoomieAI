
import React from "react";

export function CoOwnerProfileLoading() {
  return (
    <div className="py-10 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mr-2"></div>
      <span>Loading your profile...</span>
    </div>
  );
}
