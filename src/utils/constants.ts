export const FONT = 'Arial';

export const getCanvasConfig = (isDark: boolean) => ({
  bgColor: isDark ? '#374151' : '#efefef',
  ratio: window.devicePixelRatio || 1,
  textSize: 12,
  textScale: 0.9,
  lineWidth: 1,
  textBaseline: 'middle' as const,
  textAlign: 'center' as const,
  longColor: isDark ? '#E5E7EB' : '#3e3e3e',
  shortColor: isDark ? '#9CA3AF' : '#8f8f8f',
  textColor: isDark ? '#E5E7EB' : '#374151',
  subTextColor: isDark ? '#9CA3AF' : '#6B7280',
  focusColor: isDark ? '#6D28D9' : '#efefef',
  lineColor: isDark ? '#4B5563' : '#efefef'
});

export const getRulerConfig = () =>({
   tickSpacing: 3,
   scrollSpeed: 15,
   rulerHeight: 40 
} );
