'use client';

import { motion } from 'framer-motion';

interface CurvedHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function CurvedHeader({ title, subtitle, className = '' }: CurvedHeaderProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Gradient Background */}
      <div className="relative bg-gradient-to-br from-navy to-mavi-blue pt-12 pb-24 px-6 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-light-blue/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-cyan/10 rounded-full blur-3xl" />
        
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-light-blue text-lg">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64 C360,120 1080,120 1440,64 L1440,120 L0,120 Z"
              fill="#F8FAFC"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
