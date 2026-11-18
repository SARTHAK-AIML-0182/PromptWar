import React, { useState } from 'react';
import { Currency, FullReport, PastReportItem, AgentStatus } from './types';
import { Navbar } from './components/Navbar';
import { InputScreen } from './components/screens/InputScreen';
import { ProgressScreen } from './components/screens/ProgressScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { HistoryModal } from './components/Modal';
import { runMultiAgentPipeline } from './services/agentEngine';
import { saveReportLocally, getStoredReports, getStoredReportById } from './services/storage';

export function App() {
  const [screen, setScreen] = useState<'input' | 'progress' | 'result'>('input');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [report, setReport] = useState<FullReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live Agent Progress State
  const [statuses, setStatuses] = useState<AgentStatus[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Past reports modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pastReports, setPastReports] = useState<PastReportItem[]>([]);

  const handleStartAnalysis = async (payload: any) => {
    setIsLoading(true);
    setScreen('progress');
    setError(null);
    setLogs(['Initializing Multi-Agent System in React...']);

    try {
      const fullReport = await runMultiAgentPipeline(payload, {
        onStatusUpdate: (updatedStatuses) => {
          setStatuses(updatedStatuses);
        },
        onLog: (msg) => {
          setLogs(prev => [msg, ...prev].slice(0, 8));
        }
      });

      // Save to localStorage for instant reload
      saveReportLocally(fullReport);
      setReport(fullReport);
      setScreen('result');
    } catch (err: any) {
      console.error("Pipeline execution error:", err);
      setError(err.message || 'An error occurred during agent analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenHistory = () => {
    const list = getStoredReports();
    setPastReports(list);
    setHistoryOpen(true);
  };

  const handleSelectPastReport = (jobId: string) => {
    const rep = getStoredReportById(jobId);
    if (rep) {
      setReport(rep);
      setScreen('result');
    } else {
      alert('Selected report could not be loaded.');
    }
  };

  const handleNewAnalysis = () => {
    setReport(null);
    setScreen('input');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar
        currency={currency}
        onCurrencyToggle={() => setCurrency(prev => prev === 'INR' ? 'USD' : 'INR')}
        onOpenHistory={handleOpenHistory}
        onNewAnalysis={handleNewAnalysis}
        hasActiveReport={screen === 'result'}
      />

      <main className="flex-1">
        {screen === 'input' && (
          <InputScreen
            currency={currency}
            onSubmit={handleStartAnalysis}
            isLoading={isLoading}
          />
        )}

        {screen === 'progress' && (
          <ProgressScreen
            statuses={statuses}
            logs={logs}
            error={error}
            onRetry={() => setScreen('input')}
          />
        )}

        {screen === 'result' && report && (
          <ResultScreen
            report={report}
            currency={currency}
            onReset={handleNewAnalysis}
          />
        )}
      </main>

      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        reports={pastReports}
        onSelectReport={handleSelectPastReport}
      />
    </div>
  );
}

export default App;
