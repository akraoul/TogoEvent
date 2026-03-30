import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneIcon,
  EnvelopeIcon,
  ShareIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
  return (
    <footer className="footer-togo">
      <div className="container mx-auto px-4 py-4">
        {/* Footer horizontal compact */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          {/* Logo et réseaux sociaux */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TicketIcon className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="logo-togo text-sm">TogoEvents</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">N°1 billetterie</p>
              </div>
            </div>
            <div className="flex gap-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 bg-gray-100 dark:bg-slate-800 rounded flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
              >
                <ShareIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 bg-gray-100 dark:bg-slate-800 rounded flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
              >
                <ShareIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 bg-gray-100 dark:bg-slate-800 rounded flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
              >
                <ShareIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </a>
            </div>
          </div>

          {/* Liens rapides horizontaux */}
          <div className="flex items-center gap-4 text-xs">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Accueil
            </Link>
            <Link to="/categories" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Catégories
            </Link>
            <Link to="/organiser" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Organiser
            </Link>
            <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Contact
            </Link>
            <Link to="/support" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Support
            </Link>
          </div>

          {/* Contact et paiement */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <PhoneIcon className="w-3 h-3 text-purple-600" />
              <span>+228 90 12 34 56</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <EnvelopeIcon className="w-3 h-3 text-purple-600" />
              <span>support@togoevents.tg</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Paiement:</span>
              <span className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">T-Money</span>
              <span className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">Flooz</span>
            </div>
          </div>
        </div>

        {/* Copyright horizontal */}
        <div className="border-t border-gray-200 dark:border-slate-700 mt-4 pt-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="text-center text-gray-600 dark:text-gray-400 text-xs">
              <p>&copy; 2026 TogoEvents. Made with ❤️ au Togo</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <Link to="/about" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                À propos
              </Link>
              <Link to="/privacy" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
