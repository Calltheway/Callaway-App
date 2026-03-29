// ─────────────────────────────────────────────
// KEEPER — Design System Constants
// ─────────────────────────────────────────────

export const Colors = {
  // Brand
  navy:    '#0F1C3F',
  emerald: '#00C48C',

  // Navy scale
  navyLight:  '#1A2F6B',
  navyMedium: '#152450',
  navyDark:   '#0A1229',

  // Emerald scale
  emeraldLight: '#33D0A4',
  emeraldDark:  '#00A370',

  // Semantic
  success: '#00C48C',
  warning: '#FFB020',
  error:   '#E53935',
  info:    '#2196F3',

  // Neutrals
  white:       '#FFFFFF',
  surface:     '#F8F9FC',
  surfaceAlt:  '#F0F3F8',
  border:      '#E4E8EF',
  borderDark:  '#C8D0DF',

  // Text
  textPrimary:   '#0F1C3F',
  textSecondary: '#5A6A8A',
  textTertiary:  '#8A97B0',
  textInverse:   '#FFFFFF',
  textEmerald:   '#00C48C',

  // Issue status colors
  statusNew:        '#2196F3',
  statusInProgress: '#FFB020',
  statusResolved:   '#00C48C',
  statusDismissed:  '#8A97B0',

  // Transparent overlays
  overlay:      'rgba(15, 28, 63, 0.6)',
  overlayLight: 'rgba(15, 28, 63, 0.08)',
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BorderRadius = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  full: 9999,
} as const;

export const FontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  28,
  xxxl: 34,
  hero: 40,
} as const;

export const FontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
  heavy:    '800' as const,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#0F1C3F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F1C3F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F1C3F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

// Issue type display config
export const IssueTypeConfig = {
  forgotten_subscription: {
    label: 'Forgotten Subscription',
    icon:  'repeat',
    color: '#E53935',
  },
  price_increase: {
    label: 'Price Increase',
    icon:  'trending-up',
    color: '#FF7043',
  },
  duplicate_charge: {
    label: 'Duplicate Charge',
    icon:  'copy',
    color: '#E53935',
  },
  unused_subscription: {
    label: 'Unused Subscription',
    icon:  'clock',
    color: '#FF7043',
  },
  overpriced_service: {
    label: 'Overpriced Service',
    icon:  'dollar-sign',
    color: '#FFB020',
  },
  unclaimed_refund: {
    label: 'Unclaimed Refund',
    icon:  'gift',
    color: '#00C48C',
  },
  warranty_expiring: {
    label: 'Warranty Expiring',
    icon:  'shield',
    color: '#2196F3',
  },
  billing_error: {
    label: 'Billing Error',
    icon:  'alert-circle',
    color: '#E53935',
  },
  free_trial_ending: {
    label: 'Free Trial Ending',
    icon:  'calendar',
    color: '#9C27B0',
  },
} as const;

export const ActionConfig = {
  cancel: {
    label: 'Cancel Subscription',
    icon:  'x-circle',
    color: '#E53935',
  },
  dispute: {
    label: 'Dispute Charge',
    icon:  'alert-triangle',
    color: '#FF7043',
  },
  negotiate: {
    label: 'Negotiate Bill',
    icon:  'phone',
    color: '#00C48C',
  },
  claim: {
    label: 'Claim Refund',
    icon:  'gift',
    color: '#00C48C',
  },
  review: {
    label: 'Review Details',
    icon:  'eye',
    color: '#2196F3',
  },
  switch: {
    label: 'Switch Provider',
    icon:  'refresh-cw',
    color: '#9C27B0',
  },
} as const;

export const StatusConfig = {
  new: {
    label: 'New',
    color: '#2196F3',
    bg:    '#E3F2FD',
  },
  in_progress: {
    label: 'In Progress',
    color: '#FFB020',
    bg:    '#FFF8E1',
  },
  resolved: {
    label: 'Resolved',
    color: '#00C48C',
    bg:    '#E0FAF3',
  },
  dismissed: {
    label: 'Dismissed',
    color: '#8A97B0',
    bg:    '#F0F3F8',
  },
} as const;
