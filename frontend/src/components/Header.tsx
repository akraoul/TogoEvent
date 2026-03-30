import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  Bars3Icon, 
  XMarkIcon, 
  TicketIcon,
  UserCircleIcon,
  FunnelIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import FilterDropdown from './FilterDropdown.tsx';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'user' | 'organizer' | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Vérifier l'état de connexion au chargement
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const type = localStorage.getItem('userType') as 'user' | 'organizer' | null;
    setIsLoggedIn(loggedIn);
    setUserType(type);
  }, [location]); // Re-vérifier à chaque changement de route

  const handleLogout = () => {
    // Supprimer toutes les données de connexion
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('companyName');
    localStorage.removeItem('companyDescription');
    
    // Mettre à jour l'état
    setIsLoggedIn(false);
    setUserType(null);
    
    // Rediriger vers la page d'accueil
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleFiltersChange = (filters: any) => {
    setCurrentFilters(filters);
    // Stocker les filtres pour les utiliser dans la HomePage
    // Vous pourriez utiliser un context ou un state management global
    console.log('Filters updated in Header:', filters);
    
    // Pour l'instant, on stocke dans localStorage pour la démo
    localStorage.setItem('currentFilters', JSON.stringify(filters));
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="header-togo sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Logo et navigation principale */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="logo-togo flex items-center gap-2">
            <TicketIcon className="w-8 h-8 text-purple-600" />
            <div>
              <div className="font-bold">TogoEvents</div>
              <div className="text-xs text-gray-600 font-normal">
                N°1 billetterie
              </div>
            </div>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link 
              to="/categories" 
              className={`text-sm font-medium transition-colors ${
                isActiveLink('/categories') ? 'text-togo-orange' : 'text-gray-700 hover:text-togo-orange'
              }`}
            >
              Catégories
            </Link>
            {isLoggedIn && userType === 'organizer' && (
              <Link 
                to="/organiser" 
                onClick={(e) => {
                  if (!isLoggedIn || userType !== 'organizer') {
                    e.preventDefault();
                    // Rediriger vers la connexion si ce n'est pas un organisateur
                    navigate('/login');
                    return;
                  }
                }}
                className={`text-sm font-medium transition-colors ${
                  isActiveLink('/organiser') ? 'text-togo-orange' : 'text-gray-700 hover:text-togo-orange'
                }`}
              >
                Organiser un événement
              </Link>
            )}
            <Link 
              to="/contact" 
              className={`text-sm font-medium transition-colors ${
                isActiveLink('/contact') ? 'text-togo-orange' : 'text-gray-700 hover:text-togo-orange'
              }`}
            >
              Contact
            </Link>
            {isLoggedIn && (
              <Link 
                to={userType === 'organizer' ? '/organizer' : '/'} 
                className="flex items-center gap-1"
              >
                <UserCircleIcon className="w-5 h-5" />
                {userType === 'organizer' ? 'Organisateur' : 'Compte'}
              </Link>
            )}
          </nav>

          {/* Actions et menu mobile */}
          <div className="flex items-center gap-3">
            {/* Boutons connexion/inscription ou menu utilisateur */}
            <div className="hidden md:flex items-center gap-2">
              {isLoggedIn ? (
                // Menu utilisateur connecté
                <div className="flex items-center gap-2">
                  <Link 
                    to={userType === 'organizer' ? '/organizer' : '/'} 
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-togo-orange transition-colors"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    {userType === 'organizer' ? 'Organisateur' : 'Compte'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                    title="Se déconnecter"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Déconnexion
                  </button>
                </div>
              ) : (
                // Boutons connexion/inscription
                <>
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-gray-700 hover:text-togo-orange transition-colors"
                  >
                    Se connecter
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn-primary text-sm py-2 px-4"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>

            {/* Menu mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-gray-700" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="pb-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un événement, une ville, une date..."
                  className="input-field pl-10 pr-4 py-3 w-full"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-togo-orange text-white px-4 py-2 rounded-md hover:bg-togo-orange/90 transition-colors"
                >
                  Rechercher
                </button>
              </div>
            </form>
            
            {/* Icône du filtre à droite de la barre */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors relative"
                title="Filtres"
              >
                <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {filterOpen && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full"></span>
                )}
              </button>
              
              {/* Dropdown des filtres */}
              {filterOpen && (
                <div className="absolute top-full right-0 mt-2 z-50">
                  <FilterDropdown 
                    onClose={() => setFilterOpen(false)} 
                    onFiltersChange={handleFiltersChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu mobile overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="logo-togo flex items-center gap-2">
                  <TicketIcon className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="font-bold">TogoEvents</div>
                    <div className="text-xs text-gray-600">N°1 billetterie</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </div>

            <nav className="p-4 space-y-3">
              <Link
                to="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-4 rounded-lg hover:bg-gray-100 font-medium text-gray-700"
              >
                Catégories
              </Link>
              {isLoggedIn && userType === 'organizer' && (
                <Link
                  to="/organiser"
                  onClick={() => {
                    if (!isLoggedIn || userType !== 'organizer') {
                      // Rediriger vers la connexion si ce n'est pas un organisateur
                      navigate('/login');
                      return;
                    }
                    setMobileMenuOpen(false);
                  }}
                  className="block py-3 px-4 rounded-lg hover:bg-gray-100 font-medium text-gray-700"
                >
                  Organiser un événement
                </Link>
              )}
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-4 rounded-lg hover:bg-gray-100 font-medium text-gray-700"
              >
                Contact
              </Link>
              <Link
                to={isLoggedIn ? (userType === 'organizer' ? '/organizer' : '/') : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-4 rounded-lg hover:bg-gray-100 font-medium flex items-center gap-2"
              >
                <UserCircleIcon className="w-5 h-5" />
                {isLoggedIn ? (userType === 'organizer' ? 'Mon organisateur' : 'Mon compte') : 'Se connecter'}
              </Link>
              
              {isLoggedIn ? (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full py-3 px-4 text-center font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center gap-2"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-3 px-4 text-center font-medium text-gray-700 hover:bg-gray-100 rounded-lg mb-2"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full btn-primary text-center"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
