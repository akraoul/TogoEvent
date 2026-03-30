import React, { useState } from 'react';
import { 
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  SparklesIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface FilterSectionProps {
  onFiltersChange: (filters: FilterState) => void;
}

interface FilterState {
  categories: string[];
  location: string;
  dateRange: string;
  sortBy: string;
}

const FilterSection: React.FC<FilterSectionProps> = ({ onFiltersChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    location: '',
    dateRange: '',
    sortBy: 'popularity'
  });
  const [locationInput, setLocationInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const dateRanges = [
    { id: 'today', name: "Aujourd'hui" },
    { id: 'week', name: 'Cette semaine' },
    { id: 'month', name: 'Ce mois' },
    { id: 'quarter', name: 'Ce trimestre' }
  ];

  const sortOptions = [
    { id: 'popularity', name: 'Popularité' },
    { id: 'date', name: 'Date' },
    { id: 'price-asc', name: 'Prix croissant' },
    { id: 'price-desc', name: 'Prix décroissant' }
  ];

  const sections = [
    { id: 'categories', name: 'Catégorie', icon: SparklesIcon, count: categories.length },
    { id: 'location', name: 'Près de', icon: MapPinIcon, count: 0 },
    { id: 'date', name: 'Date', icon: CalendarIcon, count: dateRanges.length },
    { id: 'sortBy', name: 'Trier par', icon: ArrowPathIcon, count: sortOptions.length }
  ];

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) {
      handleFilterChange('location', locationInput.trim());
    }
  };

  const handleLocationClear = () => {
    setLocationInput('');
    handleFilterChange('location', '');
  };

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate || endDate) {
      const dateRange = `${startDate}|${endDate}`;
      handleFilterChange('dateRange', dateRange);
    }
  };

  const handleDateClear = () => {
    setStartDate('');
    setEndDate('');
    handleFilterChange('dateRange', '');
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
    setStartDate('');
    setEndDate('');
    onFiltersChange(newFilters);
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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
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
                Effacer tout
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              {isExpanded ? (
                <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sections Compactes */}
      {isExpanded && (
        <div className="p-4 space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const activeCount = getActiveFilterCount(section.id);
            const isSectionActive = activeSection === section.id;

            return (
              <div key={section.id} className="border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-gray-900 dark:text-gray-50 text-sm">
                      {section.name}
                    </span>
                    {activeCount > 0 && (
                      <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs px-2 py-1 rounded-full">
                        {activeCount}
                      </span>
                    )}
                  </div>
                  <ChevronDownIcon 
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isSectionActive ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Options cachées */}
                {isSectionActive && (
                  <div className="p-3 border-t border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700">
                    {section.id === 'categories' && (
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryToggle(category.id)}
                            className={`p-2 rounded border text-xs font-medium transition-all ${
                              filters.categories.includes(category.id)
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-500 hover:border-purple-300 dark:hover:border-purple-600'
                            }`}
                          >
                            <span className="mr-1">{category.icon}</span>
                            {category.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {section.id === 'price' && (
                      <div className="space-y-1">
                        {priceRanges.map((range) => (
                          <button
                            key={range.id}
                            onClick={() => handleFilterChange('priceRange', range.id)}
                            className={`w-full p-2 rounded border text-xs font-medium transition-all text-left ${
                              filters.priceRange === range.id
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-500 hover:border-purple-300 dark:hover:border-purple-600'
                            }`}
                          >
                            {range.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {section.id === 'date' && (
                      <form onSubmit={handleDateSubmit} className="space-y-3">
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Date de début
                            </label>
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Date de fin (optionnel)
                            </label>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                          >
                            Appliquer
                          </button>
                          {(startDate || endDate) && (
                            <button
                              type="button"
                              onClick={handleDateClear}
                              className="px-3 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
                            >
                              Effacer
                            </button>
                          )}
                        </div>
                        {filters.dateRange && (
                          <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <span className="text-sm text-purple-900 dark:text-purple-100">
                                {startDate && endDate ? `Du ${startDate} au ${endDate}` : 
                                 startDate ? `À partir du ${startDate}` : 
                                 endDate ? `Jusqu'au ${endDate}` : ''}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleDateClear}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Laissez la date de fin vide pour filtrer à partir d'une date spécifique
                        </div>
                      </form>
                    )}

                    {section.id === 'location' && (
                      <form onSubmit={handleLocationSubmit} className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            placeholder="Entrez une ville ou un lieu..."
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            type="submit"
                            className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                          >
                            Rechercher
                          </button>
                        </div>
                        {filters.location && (
                          <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <span className="text-sm text-purple-900 dark:text-purple-100">
                                {filters.location}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleLocationClear}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Suggestion: Lomé, Kara, Sokodé, Atakpamé, Tsévié, Aného...
                        </div>
                      </form>
                    )}

                    {section.id === 'sortBy' && (
                      <div className="space-y-1">
                        {sortOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleFilterChange('sortBy', option.id)}
                            className={`w-full p-2 rounded border text-xs font-medium transition-all text-left ${
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
      )}
    </div>
  );
};

export default FilterSection;
