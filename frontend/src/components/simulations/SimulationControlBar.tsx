import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, FastForward, Bookmark, Download, SplitSquareVertical } from 'lucide-react';

interface SimulationControlBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentStep: number;
  maxSteps: number;
  onStepChange: (step: number) => void;
  showComparison?: boolean;
  onToggleComparison?: () => void;
  onSaveScenario?: () => void;
  onExport?: () => void;
  stepLabelPrefix?: string;
}

export const SimulationControlBar: React.FC<SimulationControlBarProps> = ({
  isPlaying,
  onTogglePlay,
  onReset,
  speed,
  onSpeedChange,
  currentStep,
  maxSteps,
  onStepChange,
  showComparison,
  onToggleComparison,
  onSaveScenario,
  onExport,
  stepLabelPrefix = 'Day'
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Play / Pause / Reset & Speed */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`p-2.5 rounded-xl font-medium text-xs flex items-center gap-2 transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>{t('controls.pause')}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{t('controls.play')}</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition-all"
            title={t('controls.reset')}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">{t('controls.reset')}</span>
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700 text-xs">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2.5 py-1 rounded-lg font-mono transition-all ${
                speed === s
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="flex items-center gap-3 w-full md:w-1/2">
        <span className="text-xs font-mono text-emerald-400 min-w-[70px]">
          {stepLabelPrefix} {currentStep}/{maxSteps}
        </span>
        <input
          type="range"
          min={1}
          max={maxSteps}
          value={currentStep}
          onChange={(e) => onStepChange(parseInt(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />
      </div>

      {/* Extra Actions: Compare, Save, Export */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {onToggleComparison && (
          <button
            onClick={onToggleComparison}
            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
              showComparison
                ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t('controls.beforeAfter')}</span>
          </button>
        )}

        {onSaveScenario && (
          <button
            onClick={onSaveScenario}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{t('controls.saveScenario')}</span>
          </button>
        )}

        {onExport && (
          <button
            onClick={onExport}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-all"
            title={t('controls.exportCsv')}
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

