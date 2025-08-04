import logoImage from '../../assets/logo.png';

export default function Logo({ variant = 'default', className = '' }) {
  const variants = {
    default: {
      container: 'flex items-center gap-x-3',
      logo: 'h-8 w-auto',
      text: 'text-orange-600 text-lg font-bold',
      subtitle: 'text-orange-500 text-xs font-medium'
    },
    white: {
      container: 'flex items-center gap-x-3',
      logo: 'h-8 w-auto',
      text: 'text-white text-lg font-bold',
      subtitle: 'text-gray-200 text-xs font-medium'
    },
    admin: {
      container: 'flex items-center gap-x-3',
      logo: 'h-8 w-auto',
      text: 'text-white text-lg font-bold',
      subtitle: 'text-orange-200 text-xs font-medium'
    },
    compact: {
      container: 'flex items-center gap-x-2',
      logo: 'h-6 w-auto',
      text: 'text-orange-600 text-sm font-bold',
      subtitle: 'text-orange-500 text-xs font-medium'
    }
  };

  const style = variants[variant] || variants.default;

  return (
    <div className={`${style.container} ${className}`}>
      <img
        src={logoImage}
        alt="IMHOTEP DATA"
        className={style.logo}
      />
      <div className="flex flex-col">
        <span className={style.text}>
          IMHOTEP DATA
        </span>
        <span className={style.subtitle}>
          Formations
        </span>
      </div>
    </div>
  );
}

// Composant pour juste l'icône (logo seul)
export function LogoIcon({ variant = 'default', className = '' }) {
  const variants = {
    default: 'h-8 w-auto',
    white: 'h-8 w-auto',
    admin: 'h-8 w-auto',
    small: 'h-6 w-auto'
  };

  const sizeClass = variants[variant] || variants.default;

  return (
    <img
      src={logoImage}
      alt="IMHOTEP DATA"
      className={`${sizeClass} ${className}`}
    />
  );
}

// Composant pour remplacer facilement par une image
export function LogoImage({ src, alt = 'IMHOTEP DATA', variant = 'default', className = '' }) {
  const variants = {
    default: 'h-8 w-auto',
    large: 'h-12 w-auto',
    small: 'h-6 w-auto'
  };

  const sizeClass = variants[variant] || variants.default;

  if (!src) {
    return <Logo variant={variant} className={className} />;
  }

  return (
    <img 
      src={src} 
      alt={alt}
      className={`${sizeClass} ${className}`}
      onError={(e) => {
        // Fallback vers le logo par défaut si l'image ne charge pas
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  );
}
