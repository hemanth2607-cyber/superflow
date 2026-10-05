import React, { useState } from 'react'
import { Icon } from '../ui/Icon'
import {
  POLYGLOT_500_LANGUAGES,
  PolyglotLanguage,
  LANGUAGE_CATEGORIES,
  searchPolyglotLanguages,
} from '../../services/polyglot500Languages'

interface LanguageCatalog500ModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectLanguage: (lang: PolyglotLanguage) => void
  currentLanguageId?: string
}

export const LanguageCatalog500Modal: React.FC<LanguageCatalog500ModalProps> = ({
  isOpen,
  onClose,
  onSelectLanguage,
  currentLanguageId,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All (500+)')

  if (!isOpen) return null

  const filteredLanguages = searchPolyglotLanguages(searchQuery, selectedCategory)

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-surface border border-gold/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-ink">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-warm flex items-center justify-between bg-gold/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold text-xl">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-ink">Universal 500+ Language Directory</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-gold/20 text-gold border border-gold/30">
                  {POLYGLOT_500_LANGUAGES.length} Languages Loaded
                </span>
              </div>
              <p className="text-xs text-muted">
                Explore, compile, and run over 500 programming languages from computing history to modern systems.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-hover text-muted hover:text-ink transition-colors cursor-pointer"
          >
            <span className="text-base leading-none">✕</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-border-warm bg-surface/50 flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 500+ languages by name, extension (e.g. .rs, .py, .f90), or paradigm..."
              className="w-full px-4 py-2 pl-9 rounded-xl bg-black/10 dark:bg-white/5 border border-border-warm text-xs text-ink focus:outline-none focus:border-gold font-mono"
            />
            <span className="absolute left-3 top-2.5 text-muted text-xs">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-muted hover:text-ink text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <span className="text-xs font-mono text-muted shrink-0">
            Showing {filteredLanguages.length} of {POLYGLOT_500_LANGUAGES.length}
          </span>
        </div>

        {/* Category Filter Carousel */}
        <div className="px-4 py-2 border-b border-border-warm/50 flex items-center gap-1.5 overflow-x-auto scrollbar-thin shrink-0 bg-surface/30">
          {LANGUAGE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gold text-black font-semibold shadow-xs'
                  : 'bg-surface hover:bg-surface-hover border border-border-warm text-muted hover:text-ink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredLanguages.map((lang) => {
            const isSelected = currentLanguageId === lang.id

            return (
              <div
                key={lang.id}
                onClick={() => {
                  onSelectLanguage(lang)
                  onClose()
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'border-gold bg-gold/15 shadow-md ring-1 ring-gold/40'
                    : 'border-border-warm hover:border-gold/50 bg-surface/40 hover:bg-surface-hover'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-display font-bold text-xs text-ink group-hover:text-gold transition-colors truncate">
                      {lang.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/5 border border-border-warm text-muted shrink-0">
                      {lang.extension}
                    </span>
                  </div>

                  <p className="text-[10px] text-muted line-clamp-1 mb-2 font-mono">
                    {lang.paradigm}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-warm/40 flex items-center justify-between text-[9px] font-mono text-muted">
                  <span className="truncate max-w-[120px]">{lang.category}</span>
                  {lang.year && <span className="opacity-70">{lang.year}</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-border-warm bg-surface flex items-center justify-between text-xs text-muted">
          <span>
            SuperFlow Universal Polyglot Engine • 505 Languages Compiled & Executed
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gold hover:bg-gold-light text-black font-semibold text-xs transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default LanguageCatalog500Modal
