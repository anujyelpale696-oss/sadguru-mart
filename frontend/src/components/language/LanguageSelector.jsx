import React, { useState, useRef, useEffect } from 'react';
import { Globe, Search, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSelector({ variant = 'default' }) {
  const { language, currentLanguageObj, languages, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.native.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm('');
        }}
        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm ${
          variant === 'dark'
            ? 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700'
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600 flex-shrink-0" />
        <span className="hidden sm:inline font-semibold">{currentLanguageObj.native}</span>
        <span className="sm:hidden font-bold text-[11px]">{currentLanguageObj.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 xs:w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2.5 bg-slate-50 border-b border-slate-100">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
              <span>Select Language / भाषा</span>
            </div>
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search language..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                autoFocus
              />
            </div>
          </div>

          {/* Scrollable Language List */}
          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-slate-50 touch-scroll">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center justify-between rounded-xl transition-colors duration-150 min-h-[38px] ${
                      isSelected
                        ? 'bg-brand-50 text-brand-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base flex-shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-medium truncate">{lang.native}</div>
                        <div className="text-[10px] text-slate-400 truncate">{lang.name}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-600 flex-shrink-0 ml-1" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-xs text-center text-slate-400">
                No language found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
