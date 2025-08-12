import { CheckCircle, X } from 'lucide-react';
import { clsx } from '../../utils/helpers';

export default function SuccessMessage({ 
  message, 
  onDismiss,
  className,
  title = 'Succès'
}) {
  if (!message) return null;

  const displayMessage = typeof message === 'string' ? message : message.message || 'Opération réussie';

  return (
    <div className={clsx(
      'rounded-md bg-green-50 border border-green-200 p-4',
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-green-800">
            {title}
          </h3>
          <div className="mt-2 text-sm text-green-700">
            {displayMessage}
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
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
