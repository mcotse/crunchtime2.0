import React from 'react';
import {
  UtensilsIcon, PartyPopperIcon, DumbbellIcon, ClapperboardIcon,
  CoffeeIcon, HomeIcon, PlaneIcon, CalendarIcon, ShoppingCartIcon,
  BarChart3Icon, SunsetIcon, TargetIcon, Flower2Icon, SunriseIcon, BanIcon,
} from 'lucide-react';

const COVER_ICONS: Record<string, React.ComponentType<{ size?: string | number; strokeWidth?: string | number; style?: React.CSSProperties; className?: string }>> = {
  utensils: UtensilsIcon,
  'party-popper': PartyPopperIcon,
  dumbbell: DumbbellIcon,
  clapperboard: ClapperboardIcon,
  coffee: CoffeeIcon,
  home: HomeIcon,
  plane: PlaneIcon,
  calendar: CalendarIcon,
  'shopping-cart': ShoppingCartIcon,
  'bar-chart-3': BarChart3Icon,
  sunset: SunsetIcon,
  target: TargetIcon,
  'flower-2': Flower2Icon,
  sunrise: SunriseIcon,
  ban: BanIcon,
};

export function CoverIcon({ name, size = 22, strokeWidth = 1.5, style, className }: {
  name: string;
  size?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const Icon = COVER_ICONS[name] ?? CalendarIcon;
  return <Icon size={size} strokeWidth={strokeWidth} style={style} className={className} />;
}

export const COVER_ICON_NAMES = Object.keys(COVER_ICONS);
