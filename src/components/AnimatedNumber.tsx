import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';

interface Props {
  value: number;
  formatter?: (val: number) => string;
  duration?: number;
  style?: TextStyle;
  trigger?: any;
}

export const AnimatedNumber: React.FC<Props> = ({ 
  value, 
  formatter = (val) => val.toFixed(2), 
  duration = 1000, 
  style,
  trigger
}) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function (easeOutExpo) for a premium slow-down effect at the end
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCurrentValue(value * easeProgress);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };
    
    // reset if value changes dramatically or on mount
    setCurrentValue(0);
    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration, trigger]);

  return (
    <Text style={style}>
      {formatter(currentValue)}
    </Text>
  );
};
