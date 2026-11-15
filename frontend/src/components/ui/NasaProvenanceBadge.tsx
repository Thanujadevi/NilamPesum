import React from 'react';
import { Database, ShieldCheck, Cpu, Sliders } from 'lucide-react';

interface NasaProvenanceBadgeProps {
  category: 1 | 2 | 3 | 4;
  sourceText?: string;
  resolution?: string;
  className?: string;
}

export const NasaProvenanceBadge: React.FC<NasaProvenanceBadgeProps> = ({
  category,
  sourceText,
  resolution,
  className = '',
}) => {
  const configs = {
    1: {
      label: 'Category 1: NASA Source Data',
      labelTa: 'வகை 1: நாசா நேரடி செயற்கைக்கோள் தரவு',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: Database,
    },
    2: {
      label: 'Category 2: Application-Calculated Indicator',
      labelTa: 'வகை 2: கணக்கிடப்பட்ட வேளாண் குறிகாட்டி',
      color: 'bg-blue-50 text-blue-800 border-blue-300',
      icon: Cpu,
    },
    3: {
      label: 'Category 3: Agricultural Recommendation',
      labelTa: 'வகை 3: வேளாண் பயிர் சுழற்சி பரிந்துரை',
      color: 'bg-amber-50 text-amber-900 border-amber-300',
      icon: ShieldCheck,
    },
    4: {
      label: 'Category 4: Simulated Scenario (What-If)',
      labelTa: 'வகை 4: மாதிரி காலநிலை சோதனை',
      color: 'bg-purple-50 text-purple-800 border-purple-300',
      icon: Sliders,
    },
  };

  const config = configs[category];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
      {sourceText && <span className="opacity-75 font-normal">({sourceText})</span>}
      {resolution && <span className="ml-1 text-[10px] bg-white/70 px-1 rounded border">{resolution}</span>}
    </div>
  );
};

