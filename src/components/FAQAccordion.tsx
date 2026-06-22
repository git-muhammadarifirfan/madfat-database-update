import React, { useState, useRef, useEffect } from 'react';
import { FAQItem } from '../types';
import { Plus, HelpCircle } from 'lucide-react';
import { gsap } from 'gsap';

interface FAQAccordionProps {
  items: FAQItem[];
}

interface FAQAccordionItemProps {
  key?: React.Key;
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQAccordionItem({ item, isOpen, onToggle }: FAQAccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    gsap.to(contentRef.current, {
      height: isOpen ? 'auto' : 0,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }, [isOpen]);

  return (
    <div className="border-b-2 border-sand-gold/20 pb-4">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center text-left py-4 hover:text-blaze-orange transition-colors duration-200 cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-obsidian transition-colors ${isOpen ? 'bg-blaze-orange text-white' : 'bg-cream-warm text-obsidian'
            }`}>
            <HelpCircle className="w-4 h-4" />
          </div>
          <span className="font-hero text-base sm:text-lg font-bold text-obsidian line-clamp-1 sm:line-clamp-none">
            {item.question}
          </span>
        </div>
        <div
          className={`w-8 h-8 rounded-full border-2 border-obsidian flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? 'bg-obsidian text-white rotate-[135deg]' : 'bg-white text-blaze-orange'
            }`}
        >
          <Plus className="w-4 h-4" />
        </div>
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ height: 0 }}
      >
        <p className="py-2.5 pl-11 pr-4 text-sm sm:text-base text-on-surface-variant leading-relaxed font-sans">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(prevIndex => prevIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <FAQAccordionItem
          key={index}
          item={item}
          isOpen={openIndex === index}
          onToggle={() => toggleIndex(index)}
        />
      ))}
    </div>
  );
}
