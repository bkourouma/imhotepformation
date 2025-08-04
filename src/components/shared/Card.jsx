import { clsx } from '../../utils/helpers';

export default function Card({ 
  children, 
  className,
  padding = true,
  ...props 
}) {
  return (
    <div
      className={clsx(
        'card',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        'border-b border-gray-200 pb-4 mb-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3
      className={clsx(
        'text-lg font-semibold text-gray-900',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div
      className={clsx(className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        'border-t border-gray-200 pt-4 mt-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
