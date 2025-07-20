

import React, { useState } from 'react';
import { runAdvancedPositioningAudit, runPositionShiftSimulation, downloadAsJson } from '../services/geminiService';
import type { AdvancedChannelPositioningData, PositionShiftSimulationData, PositionShiftStyle, QuadrantPosition } from '../types';
import { ChevronLeftIcon, MapIcon, LightBulbIcon, SparklesIcon, CheckCircleIcon, UserGroupIcon, EyeIcon, ClipboardDocumentListIcon, ArrowDownTrayIcon, ChevronUpDownIcon } from './icons';
import type { Language } from '../services/localization';

const ResultCard = ({ title, icon: Icon, children, className }: { title: string; icon?: React.FC<{className?:string}>; children: React.ReactNode; className?: string }) => (
    <div className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col ${className}`}>
      {title && 
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            {Icon && <Icon className="w-6 h-6 mr-3 text-pink-300" />}
            {title}
        </h3>
      }
      <div className="flex-grow">{children}</div>
    </div>
);

const QuadrantMap = ({ mapData }: { mapData: AdvancedChannelPositioningData['positioningMap'] }) => {
    const { xAxisLabel, yAxisLabel, userPosition, competitors } = mapData;
    const [leftX, rightX] = xAxisLabel.split('<->').map(s => s.trim());
    const [bottomY, topY] = yAxisLabel.split('<->').map(s => s.trim());

    const transformCoord = (pos: QuadrantPosition) => ({
        x: 50 + (pos.x / 100) * 45,
        y: 50 - (pos.y / 100) * 45
    });

    const userCoord = transformCoord(userPosition);
    const competitorCoords = competitors.map(c => ({...c, ...transformCoord(c)}));

    return (
        <div className="relative w-full aspect-square max-w-lg mx-auto bg-black/20 rounded-xl p-4">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Grid lines */}
                <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                
                {/* Competitor Points */}
                {competitorCoords.map((c, i) => (
                    <g key={i}>
                        <circle cx={c.x} cy={c.y} r="1.5" fill="rgba(255,255,255,0.4)" />
                        <text x={c.x + 2} y={c.y + 0.5} fontSize="2" fill="rgba(255,255,255,0.6)">{c.name}</text>
                    </g>
                ))}

                {/* User Point */}
                <circle cx={userCoord.x} cy={userCoord.y} r="2.5" fill="#ec4899" stroke="white" strokeWidth="0.5"/>
                <text x={userCoord.x} y={userCoord.y - 3} fontSize="2.5" fill="white" textAnchor="middle" className="font-bold">You</text>
            </svg>
            {/* Axis Labels */}
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-white/70 font-semibold">{xAxisLabel}</span>
            <span className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-white/70 font-semibold origin-top-left">{yAxisLabel}</span>
        </div>
    );
};

const CompetitiveHeatmap = ({ heatmapData }: { heatmapData: AdvancedChannelPositioningData['competitiveHeatmap'] }) => {
    const getOpportunityColor = (opp: 'Low' | 'Medium' | 'High') => {
        if (opp === 'High') return 'bg-green-400/80';
        if (opp === 'Medium') return 'bg-yellow-400/80';
        return 'bg-red-400/80';
    }
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {heatmapData.map((cell, i) => (
                <div key={i} className="bg-black/30 p-3 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-2 py-0.5 text-xs font-bold text-white rounded-bl-lg" style={{backgroundColor: `rgba(236, 72, 153, ${cell.density / 100})`}}>{cell.density}%</div>
                    <p className="font-semibold text-white/90 text-sm pr-6">{cell.angle}</p>
                    <div className={`mt-2 flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full text-black ${getOpportunityColor(cell.opportunity)} w-fit`}>
                         {cell.opportunity} Opportunity
                    </div>
                </div>
            ))}
        </div>
    );
};

interface ChannelPositioningMapProps {
    onBack: () => void;
    t: (key: string) => string;
    language: Language;
}

const ChannelPositioningMap = ({ onBack, t, language }: ChannelPositioningMapProps) => {
  const [niche, setNiche] = useState('');
  const [tone, setTone] = useState('');
  const [about, setAbout] = useState('');
  const [titles, setTitles] = useState('');
  const [sampleComments, setSampleComments] = useState('');
  const [visualsDescription, setVisualsDescription] = useState('');


  const [result, setResult] = useState<AdvancedChannelPositioningData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for the simulator
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<PositionShiftSimulationData | null>(null);
  const [selectedShiftStyle, setSelectedShiftStyle] = useState<PositionShiftStyle>('More Educational & In-Depth');

  // State for action plan checklist
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({});

  const handleSubmit = async () => {
    if (!niche.trim() || !tone.trim() || !about.trim() || !titles.trim() || !sampleComments.trim() || !visualsDescription.trim()) {
      setError('Please fill in all fields for a complete positioning report.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setSimulationResult(null);
    setCheckedTasks({});
    setError(null);

    try {
      const auditResult = await runAdvancedPositioningAudit(niche, tone, about, titles, sampleComments, visualsDescription, language);
      setResult(auditResult);
    } catch(e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSimulate = async () => {
      if(!result) return;
      setIsSimulating(true);
      setSimulationResult(null);
      setError(null);
      
      const currentPositioningSummary = `Current archetypes are ${result.brandArchetypes.map(a => a.name).join(' and ')}. The channel aims for a ${tone} tone in the ${niche} niche.`;
      
      try {
          const simResult = await runPositionShiftSimulation(currentPositioningSummary, selectedShiftStyle, language);
          setSimulationResult(simResult);
      } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to run simulation.');
      } finally {
          setIsSimulating(false);
      }
  }

  const handleDownloadReport = () => {
    if (!result) return;
    downloadAsJson(result, 'creator_tune_positioning_report.json');
  };

  const resetForm = () => {
    setNiche('');
    setTone('');
    setAbout('');
    setTitles('');
    setSampleComments('');
    setVisualsDescription('');
    setResult(null);
    setSimulationResult(null);
    setCheckedTasks({});
    setError(null);
    setIsLoading(false);
  };

  const renderResult = () => {
    if (!result) return null;
    return (
        <div className="space-y-6 mt-6 animate-fade-in-up">
            <ResultCard title="Audience Perception Analysis" icon={EyeIcon}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-bold text-pink-200 mb-2">Your Intended Perception</h4>
                        <p className="text-white/90 bg-black/20 p-3 rounded-lg">{result.audiencePerception.intended}</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-green-300 mb-2">Audience's Actual Perception</h4>
                        <p className="text-white/90 bg-black/20 p-3 rounded-lg">{result.audiencePerception.actual}</p>
                    </div>
                </div>
                <div className="mt-4 border-t border-white/10 pt-4">
                     <h4 className="font-bold text-yellow-300 mb-2">Perception Gap Analysis</h4>
                     <p className="text-white/90">{result.audiencePerception.gapAnalysis}</p>
                </div>
            </ResultCard>

            <ResultCard title="Positioning Quadrant Map" icon={MapIcon}>
                <QuadrantMap mapData={result.positioningMap} />
            </ResultCard>

            <ResultCard title="Competitive Heatmap & Opportunities" icon={SparklesIcon}>
                <CompetitiveHeatmap heatmapData={result.competitiveHeatmap} />
            </ResultCard>
            
             <ResultCard title="AI Content Gap Finder" icon={LightBulbIcon}>
                 <div className="space-y-4">
                    {result.contentGaps.map((gap, i) => (
                        <div key={i} className="p-4 bg-black/20 rounded-lg">
                            <h4 className="font-bold text-white">{gap.angle}</h4>
                            <p className="text-sm text-white/70 mt-1">{gap.reason}</p>
                            <p className="text-sm text-pink-300 italic mt-2">Example: "{gap.exampleTitle}"</p>
                        </div>
                    ))}
                 </div>
            </ResultCard>

            <ResultCard title="Blended Brand Archetypes 2.0" icon={UserGroupIcon}>
                <div className="space-y-4">
                    {result.brandArchetypes.map((arch, i) => (
                        <div key={i} className="p-4 bg-black/20 rounded-lg">
                            <h4 className="font-bold text-xl text-white">{arch.name}</h4>
                            <p className="text-sm text-white/80 mt-1">{arch.description}</p>
                            <p className="text-sm text-pink-200 mt-2"><strong>Strategy:</strong> {arch.strategy}</p>
                            <p className="text-xs text-white/60 mt-2">References: {arch.references.join(', ')}</p>
                        </div>
                    ))}
                </div>
            </ResultCard>
            
            <ResultCard title="Visual Differentiation Audit" icon={EyeIcon}>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="text-center">
                        <p className={`text-7xl font-bold ${result.visualDifferentiation.score > 70 ? 'text-green-400' : result.visualDifferentiation.score > 40 ? 'text-yellow-400' : 'text-red-400'}`}>{result.visualDifferentiation.score}<span className="text-4xl text-white/50">/100</span></p>
                        <p className="text-white/70 text-sm mt-1">Uniqueness Score</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-white/90 mb-3">{result.visualDifferentiation.feedback}</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-white/80">
                            {result.visualDifferentiation.suggestions.map((s,i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                </div>
            </ResultCard>

            <ResultCard title="Position Shift Simulator" icon={SparklesIcon}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="shiftStyle" className="block text-sm font-medium text-white/90 mb-2">Choose a new direction to simulate:</label>
                        <div className="relative">
                            <select id="shiftStyle" value={selectedShiftStyle} onChange={e => setSelectedShiftStyle(e.target.value as PositionShiftStyle)} className="w-full appearance-none bg-white/10 border border-white/30 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-white/80 transition">
                                 <option>More Educational & In-Depth</option>
                                 <option>More Entertaining & Humorous</option>
                                 <option>More Edgy & Controversial</option>
                                 <option>More Polished & Professional</option>
                            </select>
                            <ChevronUpDownIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                    <button onClick={handleSimulate} disabled={isSimulating} className="w-full flex items-center justify-center bg-purple-600 text-white font-bold rounded-full py-2 px-4 transition-colors hover:bg-purple-700 disabled:bg-gray-500">
                        {isSimulating ? 'Simulating...' : 'Simulate Shift'}
                    </button>
                    {simulationResult && (
                        <div className="pt-4 border-t border-white/10 space-y-3 animate-fade-in-up">
                            <h4 className="font-bold text-white">New Title Tone:</h4>
                            <p className="text-white/80">{simulationResult.newTitleTone}</p>
                             <h4 className="font-bold text-white">Thumbnail Style Suggestion:</h4>
                            <p className="text-white/80">{simulationResult.thumbnailStyleSuggestion}</p>
                             <h4 className="font-bold text-white">Example Video Hooks:</h4>
                            <ul className="list-disc list-inside text-white/80 italic space-y-1">
                                {simulationResult.videoHookExamples.map((h,i) => <li key={i}>"{h}"</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </ResultCard>

             <ResultCard title="7-Day Action Plan" icon={ClipboardDocumentListIcon}>
                <p className="text-sm text-white/70 mb-4">A step-by-step checklist based on your results to improve your channel's position this week.</p>
                <div className="space-y-3">
                    {result.actionPlan.sort((a,b) => a.day - b.day).map(item => (
                        <div key={item.day} className="flex items-start gap-4 p-3 bg-black/20 rounded-lg">
                            <input
                                type="checkbox"
                                id={`task-${item.day}`}
                                checked={!!checkedTasks[item.day]}
                                onChange={() => setCheckedTasks(prev => ({ ...prev, [item.day]: !prev[item.day] }))}
                                className="mt-1 h-5 w-5 rounded border-gray-500 bg-gray-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                style={{accentColor: '#a855f7'}}
                            />
                            <label htmlFor={`task-${item.day}`} className="flex-1 cursor-pointer">
                                <p className={`font-bold text-white ${checkedTasks[item.day] ? 'line-through text-white/50' : ''}`}>Day {item.day}: {item.task}</p>
                                <p className={`text-xs text-white/60 mt-1 ${checkedTasks[item.day] ? 'line-through' : ''}`}>{item.reason}</p>
                            </label>
                        </div>
                    ))}
                </div>
            </ResultCard>

            <div className="flex gap-4 mt-4">
                <button
                    onClick={resetForm}
                    className="flex-1 flex items-center justify-center gap-2 text-white bg-white/10 hover:bg-white/20 font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                    Create Another Report
                </button>
                <button
                    onClick={handleDownloadReport}
                    className="flex-1 flex items-center justify-center gap-2 text-white bg-purple-600 hover:bg-purple-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    {t('downloadReport')}
                </button>
            </div>
        </div>
    );
  }

  const renderForm = () => {
    if (result) return null;

    if (isLoading) {
        return (
            <div className="w-full flex flex-col items-center justify-center p-8 bg-white/10 rounded-2xl mt-6">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
                <p className="mt-4 text-white/80 font-semibold">Mapping your advanced channel position...</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 mt-6 shadow-lg border border-white/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">Channel Positioning Map</h2>
            <p className="text-white/80 mb-6">Get an advanced strategic report on your brand's unique place on YouTube.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="niche" className="block text-sm font-medium text-white/90 mb-2">Channel Niche</label>
                    <input id="niche" type="text" value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g., 'DIY Home Improvement for Renters'" className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/80 transition" />
                </div>
                <div>
                    <label htmlFor="tone" className="block text-sm font-medium text-white/90 mb-2">Intended Channel Tone</label>
                    <input id="tone" type="text" value={tone} onChange={e => setTone(e.target.value)} placeholder="e.g., 'Funny, sarcastic, and relatable'" className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/80 transition" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="about" className="block text-sm font-medium text-white/90 mb-2">About Section</label>
                    <textarea id="about" rows={3} value={about} onChange={e => setAbout(e.target.value)} placeholder="Paste the text from your channel's 'About' page..." className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/80 transition" />
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="titles" className="block text-sm font-medium text-white/90 mb-2">Example Video Titles</label>
                    <textarea id="titles" rows={3} value={titles} onChange={e => setTitles(e.target.value)} placeholder="Paste 3-5 typical video titles, separated by commas..." className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/80 transition" />
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="comments" className="block text-sm font-medium text-white/90 mb-2">Sample Audience Comments</label>
                    <textarea id="comments" rows={3} value={sampleComments} onChange={e => setSampleComments(e.target.value)} placeholder="Paste 3-5 typical comments your viewers leave..." className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/80 transition" />
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="visuals" className="block text-sm font-medium text-white/90 mb-2">Visuals Description</label>
                    <textarea id="visuals" rows={3} value={visualsDescription} onChange={e => setVisualsDescription(e.target.value)} placeholder="Describe your thumbnails, colors, and fonts. e.g., 'Bright yellow backgrounds, bold white text, surprised face...'" className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/80 transition" />
                </div>
            </div>

            {error && <div className="mt-4 text-center bg-red-500/50 text-white font-semibold p-3 rounded-lg">{error}</div>}

            <div className="mt-8 text-right">
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center justify-center bg-[#7b2ff7] text-white font-bold rounded-full px-8 py-3 transition-all duration-300 ease-in-out hover:bg-white hover:text-[#7b2ff7] disabled:bg-gray-500/50 disabled:text-white/70 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                    <MapIcon className="w-5 h-5 mr-2" />
                    Generate Advanced Report
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto my-8 animate-fade-in-up">
      <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white mb-6 font-semibold transition-colors">
        <ChevronLeftIcon className="w-5 h-5" />
        {t('backToFeatures')}
      </button>
      {renderForm()}
      {renderResult()}
    </div>
  );
};

export default ChannelPositioningMap;