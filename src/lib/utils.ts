import { type ClassValue, clsx } from "clsx";
import { useEffect, useState } from "react";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function usePrevious<T>(value: T) {
  const [{ curr, prev }, setCurrAndPrev] = useState<{ curr: T; prev: T }>({
    curr: value,
    prev: value,
  });

  useEffect(() => {
    if (curr !== value) {
      setCurrAndPrev({
        curr: value,
        prev: curr,
      });
    }
  }, [curr, value, setCurrAndPrev]);

  return prev;
}
