import { AlertCircle, X } from 'lucide-react';
import { clsx } from '../../utils/helpers';

export default function ErrorMessage({ 
  error, 
  onDismiss,
  className,
  title = 'Erreur'
}) {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message || 'Une erreur est survenue';

  return (
    <div className={clsx(
      'rounded-md bg-red-50 border border-red-200 p-4',
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {title}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            {message}
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                onClick={onDismiss}
              >
                <span className="sr-only">Fermer</span>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
