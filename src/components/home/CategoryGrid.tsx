import React from 'react';
import {
  Smartphone,
  Headphones,
  Laptop,
  Monitor,
  Volume2,
  Watch,
  Gamepad2,
  Network,
  Wifi,
  ShieldAlert,
  Home,
  BatteryCharging,
  Cpu,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';

// Icon resolver helper for categories
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Smartphone':
      return <Smartphone className="w-5 h-5" />;
    case 'Laptop':
      return <Laptop className="w-5 h-5" />;
    case 'Monitor':
      return <Monitor className="w-5 h-5" />;
    case 'Headphones':
      return <Headphones className="w-5 h-5" />;
    case 'Volume2':
      return <Volume2 className="w-5 h-5" />;
    case 'Watch':
      return <Watch className="w-5 h-5" />;
    case 'Gamepad2':
      return <Gamepad2 className="w-5 h-5" />;
    case 'Network':
      return <Network className="w-5 h-5" />;
    case 'Wifi':
      return <Wifi className="w-5 h-5" />;
    case 'ShieldAlert':
      return <ShieldAlert className="w-5 h-5" />;
    case 'Home':
      return <Home className="w-5 h-5" />;
    case 'BatteryCharging':
      return <BatteryCharging className="w-5 h-5" />;
    case 'Cpu':
      return <Cpu className="w-5 h-5" />;
    default:
      return <Layers className="w-5 h-5" />;
  }
};

export const CategoryGrid: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, products } = useStore();

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    const prodEl = document.getElementById('products-section');
    if (prodEl) {
      prodEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="categories-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Explore The Department
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Shop by Category
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-sm">
          Browse through all 15 specialized electronics categories curated for tech enthusiasts and professionals in Pakistan.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const matchingCount = products.filter((p) => p.categoryId === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`group p-4 text-left rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/20'
                  : 'bg-white text-slate-900 border-slate-200/80 hover:border-blue-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-blue-600 group-hover:bg-blue-50'
                  }`}
                >
                  {getCategoryIcon(cat.iconName)}
                </div>
                <ArrowUpRight
                  className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                    isSelected ? 'text-white' : 'text-slate-300 group-hover:text-blue-500'
                  }`}
                />
              </div>

              <h3 className="text-xs sm:text-sm font-semibold truncate leading-snug">
                {cat.name}
              </h3>
              <p
                className={`text-[11px] mt-1 truncate ${
                  isSelected ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {matchingCount > 0 ? `${matchingCount} Models Available` : 'Explore Catalog'}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
