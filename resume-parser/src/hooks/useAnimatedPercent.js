import { useEffect, useState } from "react";

// Starts at 0 and animates to `target` once mounted. Pair it with a CSS width transition.
export function useAnimatedPercent(target) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Wait a frame so the browser registers the 0% start before the transition runs.
    const id = requestAnimationFrame(() => setValue(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  return value;
}
