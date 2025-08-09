import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  Home,
  BookOpen,
  Building2,
  UserCheck,
  BarChart3,
  Users,
  Calendar,
  UserPlus,
  Eye,
  ClipboardCheck,
  GraduationCap
} from 'lucide-react';
import { clsx } from '../../utils/helpers';
import { useAdminAuth } from '../../hooks/useAdminAuth.jsx';
import Logo from './Logo';

// Navigation de base (toujours visible)
const baseNavigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: Home },
  { name: 'Employés', href: '/employes', icon: Users },
  { name: 'Mes Inscriptions', href: '/inscriptions', icon: UserCheck },
  { name: 'Nouvelle Inscription', href: '/inscriptions/new', icon: UserPlus },
];

// Navigation admin uniquement (read/write)
const adminOnlyNavigation = [
  { name: 'Formations', href: '/formations', icon: BookOpen },
  { name: 'Séances', href: '/seances', icon: Calendar },
  { name: 'Groupes', href: '/groupes', icon: Users },
  { name: 'Enseignants', href: '/enseignants', icon: GraduationCap },
  { name: 'Présences', href: '/presence', icon: ClipboardCheck },
];

// Navigation read-only pour les utilisateurs réguliers
const userReadOnlyNavigation = [
  { name: 'Voir les Séances', href: '/seances', icon: Eye },
  { name: 'Voir les Groupes', href: '/groupes', icon: Eye },
  { name: 'Voir les Enseignants', href: '/enseignants', icon: GraduationCap },
];

function NavigationItem({ item, current }) {
  return (
    <Link
      to={item.href}
      className={clsx(
        current
          ? 'bg-orange-700 text-white'
          : 'text-orange-200 hover:text-white hover:bg-orange-700',
        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
      )}
    >
      <item.icon
        className={clsx(
          current ? 'text-white' : 'text-orange-200 group-hover:text-white',
          'h-6 w-6 shrink-0'
        )}
        aria-hidden="true"
      />
      {item.name}
    </Link>
  );
}

function SidebarContent() {
  const location = useLocation();
  const { isAuthenticated: isAdmin } = useAdminAuth();

  // Debug logging
  console.log('Sidebar - isAdmin:', isAdmin);
  console.log('Sidebar - location.pathname:', location.pathname);

  // Construire la navigation en fonction du statut admin
  const navigation = [
    ...baseNavigation,
    ...(isAdmin ? adminOnlyNavigation : userReadOnlyNavigation)
  ];

  console.log('Sidebar - navigation items:', navigation);

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-orange-600 px-6 pb-4">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center">
        <Logo variant="white" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavigationItem
                    item={item}
                    current={location.pathname === item.href || 
                            (item.href !== '/' && location.pathname.startsWith(item.href))}
                  />
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-orange-700 pt-4">
        <div className="text-xs text-orange-200">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose, mobile = false }) {
  console.log('Sidebar render - mobile:', mobile, 'open:', open);

  if (mobile) {
    return (
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={onClose}
                    >
                      <span className="sr-only">Fermer le menu</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    );
  }

  return (
    <SidebarContent />
  );
}
