
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(true)
  const [touchDevice, setTouchDevice] = React.useState<boolean>(false)
  const [capacitorApp, setCapacitorApp] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Check window size
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Check if touch device
    const isTouchDevice = () => {
      return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0))
    }
    setTouchDevice(isTouchDevice())

    // Check if in a Capacitor native app
    const checkCapacitor = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core')
        setCapacitorApp(Capacitor.isNativePlatform())
      } catch (error) {
        setCapacitorApp(false)
      }
    }
    checkCapacitor()

    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Make sure we're returning just the boolean value that the sidebar component expects
  return isMobile
}

// Original functionality maintained as a separate function
export function useMobileDetails() {
  const [isMobile, setIsMobile] = React.useState<boolean>(true)
  const [touchDevice, setTouchDevice] = React.useState<boolean>(false)
  const [capacitorApp, setCapacitorApp] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Check window size
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Check if touch device
    const isTouchDevice = () => {
      return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0))
    }
    setTouchDevice(isTouchDevice())

    // Check if in a Capacitor native app
    const checkCapacitor = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core')
        setCapacitorApp(Capacitor.isNativePlatform())
      } catch (error) {
        setCapacitorApp(false)
      }
    }
    checkCapacitor()

    return () => mql.removeEventListener("change", onChange)
  }, [])

  return {
    isMobile,             // Is the screen size mobile-sized
    isTouch: touchDevice, // Is this a touch device
    isNative: capacitorApp // Is this running in a native capacitor container
  }
}

// Helper to get OS platform
export function usePlatform() {
  const [platform, setPlatform] = React.useState<'ios' | 'android' | 'web'>('web')
  
  React.useEffect(() => {
    const detectPlatform = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core')
        if (Capacitor.isNativePlatform()) {
          if (Capacitor.getPlatform() === 'ios') {
            setPlatform('ios')
          } else if (Capacitor.getPlatform() === 'android') {
            setPlatform('android')
          }
        }
      } catch (error) {
        console.error('Error detecting platform:', error)
      }
    }
    
    detectPlatform()
  }, [])
  
  return platform
}
