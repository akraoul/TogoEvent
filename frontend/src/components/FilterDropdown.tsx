import React, { useState } from 'react';
import { 
  FunnelIcon,
  XMarkIcon,
  SparklesIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface FilterDropdownProps {
  onClose: () => void;
  onFiltersChange?: (filters: FilterState) => void;
}

interface FilterState {
  categories: string[];
  location: string;
  dateRange: string;
  sortBy: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ onClose, onFiltersChange }) => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    location: '',
    dateRange: '',
    sortBy: 'popularity'
  });
  const [locationInput, setLocationInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const categories = [
    { id: 'concert', name: 'Concert', icon: '🎵' },
    { id: 'theatre', name: 'Théâtre', icon: '🎭' },
    { id: 'festival', name: 'Festival', icon: '🎪' },
    { id: 'dance', name: 'Danse', icon: '💃' },
    { id: 'exposition', name: 'Exposition', icon: '🎨' },
    { id: 'sport', name: 'Sport', icon: '⚽' },
    { id: 'conference', name: 'Conférence', icon: '🎤' },
    { id: 'cinema', name: 'Cinéma', icon: '🎬' }
  ];

  const sortOptions = [
    { id: 'popularity', name: 'Popularité' },
    { id: 'date', name: 'Date' },
    { id: 'price-asc', name: 'Prix croissant' },
    { id: 'price-desc', name: 'Prix décroissant' }
  ];

  const sections = [
    { id: 'categories', name: 'Catégorie', icon: SparklesIcon },
    { id: 'location', name: 'Près de', icon: MapPinIcon },
    { id: 'date', name: 'Date', icon: CalendarIcon },
    { id: 'sortBy', name: 'Trier par', icon: ArrowPathIcon }
  ];

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    // Communiquer au parent
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Communiquer au parent
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) {
      handleFilterChange('location', locationInput.trim());
      setLocationInput(''); // Vider l'input après application
    }
  };

  const handleLocationClear = () => {
    setLocationInput('');
    handleFilterChange('location', '');
  };

  const handleDateChange = (dateValue: string) => {
    setDateInput(dateValue);
    if (dateValue) {
      handleFilterChange('dateRange', dateValue);
    } else {
      handleFilterChange('dateRange', '');
    }
  };

  const clearAllFilters = () => {
    const newFilters = {
      categories: [],
      location: '',
      dateRange: '',
      sortBy: 'popularity'
    };
    setFilters(newFilters);
    setLocationInput('');
    setDateInput('');
    // Communiquer au parent
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const getActiveFilterCount = (sectionId: string) => {
    switch (sectionId) {
      case 'categories':
        return filters.categories.length;
      case 'location':
        return filters.location ? 1 : 0;
      case 'date':
        return filters.dateRange ? 1 : 0;
      case 'sortBy':
        return filters.sortBy !== 'popularity' ? 1 : 0;
      default:
        return 0;
    }
  };

  const totalActiveFilters = 
    filters.categories.length + 
    (filters.location ? 1 : 0) + 
    (filters.dateRange ? 1 : 0) + 
    (filters.sortBy !== 'popularity' ? 1 : 0);

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const applyFilters = () => {
    // Les filtres sont déjà appliqués automatiquement
    console.log('Filters already applied:', filters);
    onClose();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg w-96 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FunnelIcon className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-50">Filtres</h3>
            {totalActiveFilters > 0 && (
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                {totalActiveFilters}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalActiveFilters > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Effacer
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Sections Compactes */}
      <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
        {sections.map((section) => {
          const Icon = section.icon;
          const activeCount = getActiveFilterCount(section.id);
          const isSectionActive = activeSection === section.id;

          return (
            <div key={section.id} className="border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-900 dark:text-gray-50 text-xs">
                    {section.name}
                  </span>
                  {activeCount > 0 && (
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs px-1.5 py-0.5 rounded-full">
                      {activeCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {isSectionActive && (
                    <XMarkIcon 
                      className="w-3 h-3 text-gray-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSection(null);
                      }}
                    />
                  )}
                </div>
              </button>

              {/* Options cachées */}
              {isSectionActive && (
                <div className="p-2 border-t border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700">
                  {section.id === 'categories' && (
                    <div className="grid grid-cols-2 gap-1">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryToggle(category.id)}
                          className={`p-1 rounded border text-xs font-medium transition-all ${
                            filters.categories.includes(category.id)
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-500 hover:border-purple-300 dark:hover:border-purple-600'
                          }`}
                        >
                          <span className="mr-1 text-xs">{category.icon}</span>
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {section.id === 'location' && (
                    <form onSubmit={handleLocationSubmit} className="space-y-2">
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          placeholder="Ville ou lieu..."
                          className="flex-1 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors"
                        >
                          OK
                        </button>
                      </div>
                      {filters.location && (
                        <div className="flex items-center justify-between p-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded">
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            <span className="text-xs text-purple-900 dark:text-purple-100 truncate">
                              {filters.location}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleLocationClear}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </form>
                  )}

                  {section.id === 'date' && (
                    <div className="space-y-2">
                      <div>
                        <input
                          type="date"
                          value={dateInput}
                          onChange={(e) => handleDateChange(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                      {filters.dateRange && (
                        <div className="flex items-center justify-between p-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            <span className="text-xs text-purple-900 dark:text-purple-100 truncate">
                              {filters.dateRange}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDateChange('')}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {section.id === 'sortBy' && (
                    <div className="space-y-1">
                      {sortOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleFilterChange('sortBy', option.id)}
                          className={`w-full p-1 rounded border text-xs font-medium transition-all text-left ${
                            filters.sortBy === option.id
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-500 hover:border-purple-300 dark:hover:border-purple-600'
                          }`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-slate-700">
        <button
          onClick={applyFilters}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Appliquer les filtres
        </button>
      </div>
    </div>
  );
};

export default FilterDropdown;
