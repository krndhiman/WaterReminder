import React from 'react';
import { ContainerIconType } from '../types/water';
import {
  Coffee,
  CupSoda,
  GlassWater,
  Milk,
  Wine,
  Droplet,
  FlaskConical,
  Beaker,
  Beer,
} from 'lucide-react';

interface ContainerIconProps {
  icon?: ContainerIconType;
  className?: string;
}

export const ContainerIcon: React.FC<ContainerIconProps> = ({ icon = 'droplet', className = 'w-5 h-5' }) => {
  switch (icon) {
    case 'cup':
      return <Coffee className={className} />;
    case 'glass':
      return <GlassWater className={className} />;
    case 'mug':
      return <Beer className={className} />;
    case 'bottle':
      return <CupSoda className={className} />;
    case 'flask':
      return <FlaskConical className={className} />;
    case 'jug':
      return <Milk className={className} />;
    case 'gallon':
      return <Beaker className={className} />;
    case 'droplet':
    default:
      return <Droplet className={className} />;
  }
};
