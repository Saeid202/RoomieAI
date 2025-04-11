
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initialize with current window width if available (client-side)
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    // Default to false for SSR
    return false
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      console.log("Mobile breakpoint change detected, width:", window.innerWidth)
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add event listeners
    mql.addEventListener("change", onChange)
    window.addEventListener("resize", onChange)
    
    // Set initial state
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    console.log("Initial mobile detection, width:", window.innerWidth, "isMobile:", window.innerWidth < MOBILE_BREAKPOINT)
    
    // Cleanup
    return () => {
      mql.removeEventListener("change", onChange)
      window.removeEventListener("resize", onChange)
    }
  }, [])

  return !!isMobile
}
