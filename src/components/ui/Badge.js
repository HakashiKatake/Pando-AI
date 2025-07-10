'use client';

import { cn } from '@/lib/utils';

function Badge({ className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        {
          'border-transparent bg-blue-600 text-white shadow hover:bg-blue-700':
            variant === 'default',
          'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200':
            variant === 'secondary',
          'border-transparent bg-red-600 text-white shadow hover:bg-red-700':
            variant === 'destructive',
          'border-gray-300 bg-white text-gray-700': variant === 'outline',
          'border-transparent bg-green-100 text-green-800':
            variant === 'success',
          'border-transparent bg-yellow-100 text-yellow-800':
            variant === 'warning',
          'border-transparent bg-blue-100 text-blue-800':
            variant === 'info',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
