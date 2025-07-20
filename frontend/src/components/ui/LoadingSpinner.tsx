
import React from 'react';
import { ClipLoader } from 'react-spinners';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizePx = {
    sm: 16,
    md: 24,
    lg: 32
  }[size];

  return <ClipLoader size={sizePx} color="#2563eb" className={className} />;
};

export default LoadingSpinner;
