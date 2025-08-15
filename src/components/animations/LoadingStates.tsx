import React from 'react';
import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: number;
  color?: string;
  thickness?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 40,
  color = 'rgb(59, 130, 246)',
  thickness = 4
}) => {
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <svg
        className="absolute inset-0"
        viewBox="0 0 50 50"
        style={{ width: size, height: size }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="80, 200"
        />
      </svg>
    </motion.div>
  );
};

interface PulsingDotsProps {
  color?: string;
  size?: number;
}

export const PulsingDots: React.FC<PulsingDotsProps> = ({
  color = 'rgb(59, 130, 246)',
  size = 10
}) => {
  const dotVariants = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: { scale: 1.2, opacity: 1 },
  };

  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: '50%',
          }}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );
};

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  className = '',
  rounded = false
}) => {
  return (
    <motion.div
      className={`bg-gray-200 ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{ width, height }}
      animate={{
        backgroundImage: [
          'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'rgb(59, 130, 246)',
  height = 8,
  showPercentage = false
}) => {
  return (
    <div className="relative w-full">
      <div
        className="w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {showPercentage && (
        <motion.span
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {progress}%
        </motion.span>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Loading...',
  fullScreen = false
}) => {
  if (!isLoading) return null;

  return (
    <motion.div
      className={`${
        fullScreen ? 'fixed' : 'absolute'
      } inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Spinner />
        {text && (
          <motion.p
            className="text-gray-700 font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};