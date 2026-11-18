import React, { useState } from 'react';
import { Currency, FullReport, PastReportItem } from './types';
import { Navbar } from './components/Navbar';
import { InputScreen } from './components/screens/InputScreen';
import { ProgressScreen } from './components/screens/ProgressScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { HistoryModal } from './components/Modal';
import { startAnalysis, fetchPastReports, fetchReport } from './lib/api';
import { useAgentStream } from './hooks/useAgentStream';

export function App() {
  const [screen, setScreen] = useState<'input' | 'progress' | 'result'>('input');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [report, setReport] = useState<FullReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Past reports modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pastReports, setPastReports] = useState<PastReportItem[]>([]);

  // SSE Stream hook
  const { statuses, logs, error } = useAgentStream(currentJobId, (completedReport) => {
    setReport(completedReport);
    setScreen('result');
    setIsLoading(false);
  });

  const handleStartAnalysis = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await startAnalysis(payload);
      setCurrentJobId(res.job_id);
      setScreen('progress');
    } catch (err: any) {
      alert(`Error starting analysis: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleOpenHistory = async () => {
    try {
      const list = await fetchPastReports();
      setPastReports(list);
    } catch (err) {
      console.error(err);
    }
    setHistoryOpen(true);
  };

  const handleSelectPastReport = async (jobId: string) => {
    try {
      setIsLoading(true);
      const rep = await fetchReport(jobId);
      setReport(rep);
      setCurrentJobId(jobId);
      setScreen('result');
    } catch (err: any) {
      alert(`Could not load report: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setCurrentJobId(null);
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
            onRetry={() => {
              if (currentJobId) {
                // Reconnect or restart
                setScreen('input');
              }
            }}
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
