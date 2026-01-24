/**
 * Premium Haptic Feedback System
 * Inspired by Apple's UIKit Haptics & Human Interface Guidelines
 * 
 * Based on: developer.apple.com/documentation/uikit/animation-and-haptics
 * 
 * Three haptic generators:
 * 1. UIImpactFeedbackGenerator - Physical impacts (light, medium, heavy, soft, rigid)
 * 2. UISelectionFeedbackGenerator - Selection changes
 * 3. UINotificationFeedbackGenerator - Success, warning, error
 * 
 * Design Philosophy:
 * - Haptics should feel INEVITABLE, not surprising
 * - Use sparingly - only when they add meaning
 * - Match visual feedback timing precisely
 * - Lighter haptics for frequent actions, heavier for important ones
 */

// ============================================
// TYPES
// ============================================

export type ImpactStyle = 'light' | 'medium' | 'heavy' | 'soft' | 'rigid'
export type NotificationType = 'success' | 'warning' | 'error'

interface HapticPattern {
  vibrate: number | number[]
  description: string
}

// ============================================
// HAPTIC PATTERNS - Tuned for Premium Feel
// ============================================

const IMPACT_PATTERNS: Record<ImpactStyle, HapticPattern> = {
  // Light: Quick, subtle - for frequent interactions (toggles, selections)
  light: { vibrate: 8, description: 'Quick subtle tap' },
  
  // Medium: Standard button press - most common
  medium: { vibrate: 15, description: 'Standard button feedback' },
  
  // Heavy: Important actions (submit, confirm, purchase)
  heavy: { vibrate: 25, description: 'Strong confirmation' },
  
  // Soft: Elastic, cushioned feel - for drag/drop, slider endpoints
  soft: { vibrate: [5, 8, 5], description: 'Soft elastic feel' },
  
  // Rigid: Sharp, precise - for snapping to positions, grid alignment
  rigid: { vibrate: [3, 0, 12], description: 'Sharp precise snap' },
}

const NOTIFICATION_PATTERNS: Record<NotificationType, HapticPattern> = {
  // Success: Double tap - positive confirmation (payment success, form submitted)
  success: { vibrate: [10, 60, 15], description: 'Positive double tap' },
  
  // Warning: Attention pattern - needs user awareness (low battery, approaching limit)
  warning: { vibrate: [15, 40, 15, 40, 15], description: 'Attention triple pulse' },
  
  // Error: Sharp rejection pattern (failed action, validation error)
  error: { vibrate: [25, 30, 25, 30, 40], description: 'Sharp error pattern' },
}

// Selection: Ultra-light for carousel/picker changes
const SELECTION_PATTERN: HapticPattern = { 
  vibrate: 5, 
  description: 'Ultra-light selection tick' 
}

// ============================================
// DETECTION UTILITIES
// ============================================

/**
 * Check if the Vibration API is supported
 */
const isVibrationSupported = (): boolean => {
  if (typeof window === 'undefined') return false
  return 'vibrate' in navigator
}

/**
 * Check if device is mobile/tablet (haptics make sense)
 */
const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - For older browsers
    navigator.msMaxTouchPoints > 0
  )
}

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Master check: Should we trigger haptics?
 */
const shouldTriggerHaptics = (): boolean => {
  return isTouchDevice() && isVibrationSupported() && !prefersReducedMotion()
}

// ============================================
// CORE HAPTIC FUNCTIONS
// ============================================

/**
 * Trigger a vibration pattern
 */
const vibrate = (pattern: number | number[]): void => {
  if (!shouldTriggerHaptics()) return
  
  try {
    navigator.vibrate(pattern)
  } catch (e) {
    // Silently fail - haptics are enhancement, not critical
  }
}

/**
 * Impact Feedback - For physical interactions
 * 
 * Use cases:
 * - light: Toggling switches, selecting items, carousel swipe
 * - medium: Button presses, card taps, menu selections
 * - heavy: Important actions (submit, purchase, delete)
 * - soft: Drag release, slider snap, elastic bounces
 * - rigid: Grid snapping, ruler alignment, precise positioning
 */
export const hapticImpact = (style: ImpactStyle = 'medium'): void => {
  const pattern = IMPACT_PATTERNS[style]
  vibrate(pattern.vibrate)
}

/**
 * Selection Feedback - For picker/carousel changes
 * 
 * Use cases:
 * - Scrolling through a date picker
 * - Swiping between cards/stories
 * - Changing tabs
 * - Incrementing/decrementing values
 */
export const hapticSelection = (): void => {
  vibrate(SELECTION_PATTERN.vibrate)
}

/**
 * Notification Feedback - For outcomes/status changes
 * 
 * Use cases:
 * - success: Payment complete, form submitted, login successful
 * - warning: Low battery, approaching limit, needs attention
 * - error: Failed action, validation error, connection lost
 */
export const hapticNotification = (type: NotificationType): void => {
  const pattern = NOTIFICATION_PATTERNS[type]
  vibrate(pattern.vibrate)
}

// ============================================
// SEMANTIC HELPERS - Named for Intent
// ============================================

export const haptics = {
  // === SELECTIONS & NAVIGATION ===
  /** Ultra-light tick for carousel/picker changes */
  selection: () => hapticSelection(),
  /** Light tap for tab changes, toggles */
  toggle: () => hapticImpact('light'),
  /** Light tap when swiping between stories/cards */
  swipe: () => hapticSelection(),
  /** Light tap for navigation actions */
  navigate: () => hapticImpact('light'),
  
  // === BUTTON INTERACTIONS ===
  /** Standard button press feedback */
  buttonPress: () => hapticImpact('medium'),
  /** Light tap for secondary/ghost buttons */
  buttonLight: () => hapticImpact('light'),
  /** Heavy tap for primary CTA buttons */
  buttonPrimary: () => hapticImpact('heavy'),
  
  // === CARD & SURFACE INTERACTIONS ===
  /** Light tap when tapping a card */
  cardTap: () => hapticImpact('light'),
  /** Soft feel when card is lifted/dragged */
  cardLift: () => hapticImpact('soft'),
  /** Rigid snap when card drops into position */
  cardDrop: () => hapticImpact('rigid'),
  
  // === FORM INTERACTIONS ===
  /** Light tap for input focus */
  inputFocus: () => hapticImpact('light'),
  /** Heavy confirmation for form submit */
  submit: () => hapticImpact('heavy'),
  /** Soft feel for slider/range changes */
  sliderChange: () => hapticImpact('soft'),
  
  // === OUTCOMES & NOTIFICATIONS ===
  /** Success pattern - payment, submission, etc */
  success: () => hapticNotification('success'),
  /** Warning pattern - needs attention */
  warning: () => hapticNotification('warning'),
  /** Error pattern - failed action */
  error: () => hapticNotification('error'),
  
  // === SPECIAL INTERACTIONS ===
  /** Pull-to-refresh threshold reached */
  pullRefresh: () => hapticImpact('medium'),
  /** Long press activated */
  longPress: () => hapticImpact('heavy'),
  /** Snap to grid/position */
  snap: () => hapticImpact('rigid'),
  /** Elastic bounce at scroll boundaries */
  bounce: () => hapticImpact('soft'),
  
  // === LIQUID GLASS SPECIFIC ===
  /** Glass surface tap */
  glassTap: () => hapticImpact('light'),
  /** Glass element pressed */
  glassPress: () => hapticImpact('medium'),
  /** Glass morph/transition complete */
  glassMorph: () => hapticImpact('soft'),
  
  // === AI CHAT SPECIFIC ===
  /** Message sent */
  messageSent: () => hapticImpact('medium'),
  /** Message received */
  messageReceived: () => hapticImpact('light'),
  /** Typing indicator started */
  typing: () => hapticImpact('soft'),
}

// ============================================
// REACT HOOK
// ============================================

export interface UseHapticReturn {
  /** All haptic functions */
  haptics: typeof haptics
  /** Direct impact trigger */
  impact: typeof hapticImpact
  /** Direct selection trigger */
  selection: typeof hapticSelection
  /** Direct notification trigger */
  notification: typeof hapticNotification
  /** Whether haptics are supported on this device */
  isSupported: boolean
}

/**
 * React hook for haptic feedback
 * 
 * @example
 * const { haptics, isSupported } = useHaptics()
 * 
 * const handleClick = () => {
 *   haptics.buttonPress()
 *   // ... action
 * }
 */
export const useHaptics = (): UseHapticReturn => {
  return {
    haptics,
    impact: hapticImpact,
    selection: hapticSelection,
    notification: hapticNotification,
    isSupported: shouldTriggerHaptics(),
  }
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default haptics
