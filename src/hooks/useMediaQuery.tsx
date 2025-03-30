import { useState, useEffect } from 'react';

/**
 * Custom hook that returns whether a media query matches the current window.
 * 
 * @param query - CSS media query string (e.g., "(max-width: 768px)")
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with the current match state if window exists
  const getMatches = (): boolean => {
    // Check if window is defined (to avoid errors during SSR)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches());

  useEffect(() => {
    // Exit early if window is not defined (SSR)
    if (typeof window === 'undefined') {
      return undefined;
    }
    
    const mediaQuery = window.matchMedia(query);
    
    // Initial check
    setMatches(mediaQuery.matches);
    
    // Create handler for changes
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    
    // Add event listener for changes to media query
    mediaQuery.addEventListener('change', handler);
    
    // Cleanup
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export default useMediaQuery; 