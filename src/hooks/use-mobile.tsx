
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
    // Function to update state based on window size
    const updateMobileState = () => {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT
      console.log("Mobile check - width:", window.innerWidth, "isMobile:", newIsMobile)
      setIsMobile(newIsMobile)
    }
    
    // Add event listeners
    window.addEventListener("resize", updateMobileState)
    
    // Set initial state (important for first render)
    updateMobileState()
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", updateMobileState)
    }
  }, [])

  return isMobile
}
