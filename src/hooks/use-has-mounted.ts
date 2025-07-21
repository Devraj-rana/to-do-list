
"use client";

import { useState, useEffect } from 'react';

/**
 * A hook that returns true once the component has mounted on the client.
 * This is useful for preventing hydration mismatches by ensuring that
 * client-side only logic (like accessing localStorage) runs after the
 * initial server render.
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
