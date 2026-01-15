import { useState, useEffect } from 'react';

export type DeviceMode =
  | 'mobile-portrait'      // 0-479px portrait
  | 'mobile-landscape'     // 480-767px landscape
  | 'tablet-portrait'      // 768-1023px portrait
  | 'tablet-landscape'     // 1024-1279px landscape
  | 'desktop';             // 1280px+

interface DeviceInfo {
  mode: DeviceMode;
  width: number;
  height: number;
  isPortrait: boolean;
  isLandscape: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
}

const getDeviceMode = (): DeviceMode => {
  if (typeof window === 'undefined') return 'mobile-portrait';

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isPortrait = height > width;

  // Desktop: 1280px+ (any orientation)
  if (width >= 1280) {
    return 'desktop';
  }

  // Tablet Landscape: 1024-1279px landscape
  if (width >= 1024 && !isPortrait) {
    return 'tablet-landscape';
  }

  // Tablet Portrait: 768-1023px portrait OR 768-1023px (either orientation when height suggests tablet)
  if (width >= 768 && width < 1024) {
    return isPortrait ? 'tablet-portrait' : 'tablet-landscape';
  }

  // Also catch tablets in portrait that might have width >= 768
  if (width >= 768 && isPortrait) {
    return 'tablet-portrait';
  }

  // Mobile Landscape: 480-767px landscape
  if (width >= 480 && !isPortrait) {
    return 'mobile-landscape';
  }

  // Mobile Portrait: 0-479px OR portrait under 480px
  return 'mobile-portrait';
};

const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return {
      mode: 'mobile-portrait',
      width: 375,
      height: 667,
      isPortrait: true,
      isLandscape: false,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isTouch: true,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isPortrait = height > width;
  const mode = getDeviceMode();

  const isMobile = mode === 'mobile-portrait' || mode === 'mobile-landscape';
  const isTablet = mode === 'tablet-portrait' || mode === 'tablet-landscape';
  const isDesktop = mode === 'desktop';

  // Detect touch capability
  const isTouch = 'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0;

  return {
    mode,
    width,
    height,
    isPortrait,
    isLandscape: !isPortrait,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
  };
};

export const useDeviceMode = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo);

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo());
    };

    // Also handle orientation change
    const handleOrientationChange = () => {
      // Small delay to allow the browser to update dimensions
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
};

// Utility function to get responsive class names based on mode
export const getResponsiveClasses = (mode: DeviceMode) => {
  const classes = {
    // Button sizes
    buttonSize: {
      'mobile-portrait': 'w-[4.5rem] h-[4.5rem]',
      'mobile-landscape': 'w-16 h-16',
      'tablet-portrait': 'w-24 h-24',
      'tablet-landscape': 'w-[5.5rem] h-[5.5rem]',
      'desktop': 'w-32 h-32',
    },
    // Compact button sizes (for Office grid etc)
    compactButtonSize: {
      'mobile-portrait': 'w-12 h-12',
      'mobile-landscape': 'w-11 h-11',
      'tablet-portrait': 'w-16 h-16',
      'tablet-landscape': 'w-14 h-14',
      'desktop': 'w-16 h-16',
    },
    // Icon sizes
    iconSize: {
      'mobile-portrait': 28,
      'mobile-landscape': 24,
      'tablet-portrait': 36,
      'tablet-landscape': 32,
      'desktop': 44,
    },
    // Compact icon sizes
    compactIconSize: {
      'mobile-portrait': 20,
      'mobile-landscape': 18,
      'tablet-portrait': 24,
      'tablet-landscape': 22,
      'desktop': 24,
    },
    // Grid columns for activities
    activitiesGridCols: {
      'mobile-portrait': 'grid-cols-2',
      'mobile-landscape': 'grid-cols-4',
      'tablet-portrait': 'grid-cols-3',
      'tablet-landscape': 'grid-cols-4',
      'desktop': 'grid-cols-4',
    },
    // Grid gap
    gridGap: {
      'mobile-portrait': 'gap-2',
      'mobile-landscape': 'gap-3',
      'tablet-portrait': 'gap-4',
      'tablet-landscape': 'gap-3',
      'desktop': 'gap-6',
    },
    // Header spacing
    headerMargin: {
      'mobile-portrait': 'mb-3 pt-14',
      'mobile-landscape': 'mb-2 pt-10',
      'tablet-portrait': 'mb-6 pt-16',
      'tablet-landscape': 'mb-4 pt-12',
      'desktop': 'mb-8 pt-20',
    },
    // Title size
    titleSize: {
      'mobile-portrait': 'text-2xl',
      'mobile-landscape': 'text-xl',
      'tablet-portrait': 'text-4xl',
      'tablet-landscape': 'text-3xl',
      'desktop': 'text-6xl',
    },
    // Nav button sizes
    navButtonSize: {
      'mobile-portrait': 'w-10 h-10',
      'mobile-landscape': 'w-9 h-9',
      'tablet-portrait': 'w-12 h-12',
      'tablet-landscape': 'w-11 h-11',
      'desktop': 'w-14 h-14',
    },
    // Nav icon sizes
    navIconSize: {
      'mobile-portrait': 'w-5 h-5',
      'mobile-landscape': 'w-4 h-4',
      'tablet-portrait': 'w-6 h-6',
      'tablet-landscape': 'w-5 h-5',
      'desktop': 'w-7 h-7',
    },
    // Text sizes for labels
    labelSize: {
      'mobile-portrait': 'text-[10px]',
      'mobile-landscape': 'text-[9px]',
      'tablet-portrait': 'text-sm',
      'tablet-landscape': 'text-xs',
      'desktop': 'text-base',
    },
  };

  return {
    buttonSize: classes.buttonSize[mode],
    compactButtonSize: classes.compactButtonSize[mode],
    iconSize: classes.iconSize[mode],
    compactIconSize: classes.compactIconSize[mode],
    activitiesGridCols: classes.activitiesGridCols[mode],
    gridGap: classes.gridGap[mode],
    headerMargin: classes.headerMargin[mode],
    titleSize: classes.titleSize[mode],
    navButtonSize: classes.navButtonSize[mode],
    navIconSize: classes.navIconSize[mode],
    labelSize: classes.labelSize[mode],
  };
};

export default useDeviceMode;
