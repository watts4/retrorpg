import React from 'react';

export const Card = ({ className, children, ...props }) => (
  <div className={`bg-gray-800 rounded-lg shadow-md ${className || ''}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className, children, ...props }) => (
  <div className={`p-4 border-b border-gray-700 ${className || ''}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={`text-xl font-bold ${className || ''}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={`p-4 ${className || ''}`} {...props}>
    {children}
  </div>
);