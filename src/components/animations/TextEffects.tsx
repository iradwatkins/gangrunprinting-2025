import React from 'react';
import { motion, Variants } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  className = '',
  delay = 0,
  speed = 0.1
}) => {
  const letters = Array.from(text);

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speed,
        delayChildren: delay,
      },
    },
  };

  const child: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span key={index} variants={child}>
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.span>
  );
};

interface GlitchTextProps {
  text: string;
  className?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative z-10"
        animate={{
          x: [0, -2, 2, -1, 1, 0],
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      >
        {text}
      </motion.div>
      <motion.div
        className="absolute top-0 left-0 text-cyan-500 opacity-70"
        animate={{
          x: [0, 2, -2, 1, -1, 0],
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 2,
          delay: 0.02,
        }}
      >
        {text}
      </motion.div>
      <motion.div
        className="absolute top-0 left-0 text-red-500 opacity-70"
        animate={{
          x: [0, -1, 1, -2, 2, 0],
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 2,
          delay: 0.04,
        }}
      >
        {text}
      </motion.div>
    </div>
  );
};

interface GradientTextProps {
  text: string;
  className?: string;
  gradient?: string;
}

export const GradientText: React.FC<GradientTextProps> = ({
  text,
  className = '',
  gradient = 'from-blue-600 to-purple-600'
}) => {
  return (
    <motion.span
      className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}
      initial={{ backgroundPosition: '0% 50%' }}
      animate={{ backgroundPosition: '100% 50%' }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
      style={{ backgroundSize: '200% 200%' }}
    >
      {text}
    </motion.span>
  );
};

interface RotatingTextProps {
  words: string[];
  className?: string;
  interval?: number;
}

export const RotatingText: React.FC<RotatingTextProps> = ({
  words,
  className = '',
  interval = 2
}) => {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        {words[index]}
      </motion.span>
    </div>
  );
};

interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
  highlightClassName?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  className = '',
  highlightClassName = 'bg-yellow-200'
}) => {
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <motion.span
            key={index}
            className={`relative inline-block ${highlightClassName} px-1 rounded`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{ transformOrigin: 'left' }}
          >
            {part}
          </motion.span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};