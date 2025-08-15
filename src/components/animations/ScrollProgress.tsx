import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface ScrollProgressBarProps {
  color?: string;
  height?: number;
  position?: 'top' | 'bottom';
}

export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({
  color = 'rgb(59, 130, 246)',
  height = 4,
  position = 'top'
}) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className={`fixed left-0 right-0 z-50 origin-left ${
        position === 'top' ? 'top-0' : 'bottom-0'
      }`}
      style={{
        height,
        background: color,
        scaleX,
      }}
    />
  );
};

interface ScrollRevealTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const ScrollRevealText: React.FC<ScrollRevealTextProps> = ({
  text,
  className = '',
  delay = 0
}) => {
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          key={index}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  start = 0,
  duration = 2,
  prefix = '',
  suffix = '',
  className = ''
}) => {
  const [hasStarted, setHasStarted] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState(start);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [hasStarted]);

  React.useEffect(() => {
    if (hasStarted) {
      const startTime = Date.now();

      const updateValue = () => {
        const now = Date.now();
        const progress = Math.min(1, (now - startTime) / (duration * 1000));
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        const value = Math.floor(start + (end - start) * eased);
        
        setCurrentValue(value);

        if (progress < 1) {
          requestAnimationFrame(updateValue);
        } else {
          setCurrentValue(end);
        }
      };

      requestAnimationFrame(updateValue);
    }
  }, [hasStarted, start, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {currentValue}
      {suffix}
    </span>
  );
};