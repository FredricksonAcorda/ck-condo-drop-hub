export interface PillNavItem {
  label: string;
  href: string;
  ariaLabel?: string;
  variant?: 'default' | 'primary';
}

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface SocialLinkItem {
  platform: 'facebook' | 'tiktok' | 'instagram';
  href: string;
  ariaLabel: string;
}
