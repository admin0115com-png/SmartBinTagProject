import React, { useState } from 'react';
import { ALL_UK_POSTCODE_AREAS, ENGLAND_POSTCODE_AREAS, WALES_POSTCODE_AREAS, SCOTLAND_POSTCODE_AREAS, PostcodeAreaInfo } from '../data/ukPostcodeAreas';
import { MapPin, ChevronDown, Check, Sparkles } from 'lucide-react';

interface PostcodeSelectorProps {
  onSelectArea: (area: PostcodeAreaInfo) => void;
  selectedCode?: string;
  className?: string;
}

export default function PostcodeSelector({ onSelectArea, selectedCode, className = '' }: PostcodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'England' | 'Wales' | 'Scotland'>('All');
  const [search, setSearch] = useState('');

  const filteredAreas = ALL_UK_POSTCODE_AREAS.filter(item => {
    if (activeTab !== 'All' && item.country !== activeTab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return item.code.toLowerCase().includes(q) ||
           item.name.toLowerCase().includes(q) ||
           item.town.toLowerCase().includes(q) ||
           item.county.toLowerCase().includes(q);
  });

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-3 bg-[#011a14] border border-[#064e3f] hover:border-[#45D153]/50 rounded-xl text-xs text-white flex items-center justify-between font-mono transition-all cursor-pointer shadow-sm group"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <MapPin className="h-3.5 w-3.5 text-[#45D153] flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="truncate text-emerald-100 font-bold text-[11px]">
            {selectedCode ? `Area ${selectedCode} Selected` : 'Select UK Postcode Area (122 Districts)'}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-[#45D153] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-12 z-50 bg-[#02241d] border border-[#064e3f] rounded-2xl p-3 shadow-2xl space-y-2.5 max-h-[380px] flex flex-col animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-2 border-b border-[#064e3f] pb-2">
            <span className="text-[10px] font-black uppercase text-[#45D153] tracking-wider font-mono flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> UK Postcode Registry
            </span>
            <span className="text-[9px] text-emerald-200/60 font-mono">122 Official Areas</span>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code (e.g. B, EH, CF) or town…"
            className="w-full h-8 px-2.5 bg-[#011a14] border border-[#064e3f] rounded-lg text-xs text-white placeholder-emerald-600/60 outline-none focus:border-[#45D153] font-mono"
            autoFocus
          />

          <div className="flex gap-1 border-b border-[#064e3f] pb-2 text-[9px] font-mono font-bold uppercase">
            {(['All', 'England', 'Wales', 'Scotland'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#45D153] text-slate-950 font-black'
                    : 'text-emerald-200/70 hover:text-white hover:bg-[#064e3f]/40'
                }`}
              >
                {tab} {tab === 'England' ? '(99)' : tab === 'Wales' ? '(8)' : tab === 'Scotland' ? '(15)' : ''}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto space-y-1 pr-1 custom-scrollbar flex-1">
            {filteredAreas.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-4 italic font-mono">No matching UK areas found</p>
            ) : (
              filteredAreas.map((item) => (
                <button
                  key={`${item.country}-${item.code}`}
                  type="button"
                  onClick={() => {
                    onSelectArea(item);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between hover:bg-[#064e3f]/60 transition-colors cursor-pointer border ${
                    selectedCode === item.code ? 'border-[#45D153] bg-[#064e3f]/80' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-6 bg-[#011a14] border border-[#064e3f] rounded flex items-center justify-center font-mono font-black text-xs text-[#45D153]">
                      {item.code}
                    </span>
                    <div>
                      <span className="font-bold text-white text-xs block leading-tight">{item.name}</span>
                      <span className="text-[9.5px] text-emerald-200/70 font-mono leading-none">
                        {item.town}, {item.county} ({item.country})
                      </span>
                    </div>
                  </div>
                  {selectedCode === item.code && <Check className="h-4 w-4 text-[#45D153]" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
