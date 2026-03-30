import React from 'react';
import { 
  MusicalNoteIcon,
  TicketIcon,
  PaintBrushIcon,
  SparklesIcon,
  CalendarIcon,
  FireIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface IconComponentProps {
  name: string;
  className?: string;
}

const IconComponent: React.FC<IconComponentProps> = ({ name, className = "w-5 h-5" }) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    '🎵': MusicalNoteIcon,
    '🎭': TicketIcon,
    '🎪': TicketIcon,
    '🎨': PaintBrushIcon,
    '💃': SparklesIcon,
    '📅': CalendarIcon,
    '🔥': FireIcon,
    '🏢': BuildingOfficeIcon,
    '👥': UserGroupIcon,
    '⭐': StarIcon,
  };

  const SelectedIcon = iconMap[name];

  if (SelectedIcon) {
    return <SelectedIcon className={className} />;
  }

  // Fallback to emoji if icon not found
  return <span className={className}>{name}</span>;
};

export default IconComponent;
