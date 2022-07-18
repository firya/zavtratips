import { useState, useEffect } from "react";

export const useDebounce = (value: string, timeout: number = 200): string => {
  const [result, setResult] = useState<string>(value);

  useEffect(() => {
    const timer = setTimeout(() => setResult(value), timeout);

    return () => {
      clearTimeout(timer);
    };
  }, [value, timeout]);

  return result;
};
