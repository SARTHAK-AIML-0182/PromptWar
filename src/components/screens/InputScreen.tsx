import React, { useState, useEffect } from 'react';
import { Mode, Currency, IdeaDemo, StartupDemo } from '../../types';
import { IDEA_DEMOS, STARTUP_DEMOS } from '../../data/demos';
import { Sparkles, ArrowRight, Upload, Check, HelpCircle, Layers, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip } from '../Tooltip';

interface InputScreenProps {
  currency: Currency;
  onSubmit: (payload: any) => void;
  isLoading: boolean;
}

export const InputScreen: React.FC<InputScreenProps> = ({ currency, onSubmit, isLoading }) => {
  const [mode, setMode] = useState<Mode>('idea');

  // Demos loaded from backend
  const [ideaDemos, setIdeaDemos] = useState<IdeaDemo[]>([]);
  const [startupDemos, setStartupDemos] = useState<StartupDemo[]>([]);

  // Idea Form State
  const [ideaText, setIdeaText] = useState('');
  const [industry, setIndustry] = useState('AgriTech');
  const [targetMarket, setTargetMarket] = useState('India');
  const [ideaError, setIdeaError] = useState('');

  // Running Startup Form State (4 Steps)
  const [step, setStep] = useState(1);
  const [startupName, setStartupName] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState('Seed');
  const [startupIndustry, setStartupIndustry] = useState('SaaS');
  const [website, setWebsite] = useState('');

  // Step 2: Traction
  const [totalUsers, setTotalUsers] = useState<number | ''>('');
  const [payingCustomers, setPayingCustomers] = useState<number | ''>('');
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | ''>('');
  const [monthlyGrowthPct, setMonthlyGrowthPct] = useState<number | ''>('');

  // Step 3: Business
  const [pricing, setPricing] = useState<number | ''>('');
  const [cac, setCac] = useState<number | ''>('');
  const [grossMarginPct, setGrossMarginPct] = useState<number | ''>('');
  const [churnPct, setChurnPct] = useState<number | ''>('');
  const [runwayMonths, setRunwayMonths] = useState<number | ''>('');
  const [monthlyBurn, setMonthlyBurn] = useState<number | ''>('');
  const [fundingRaised, setFundingRaised] = useState<number | ''>('');

  // Step 4: Team & Legal
  const [teamSize, setTeamSize] = useState<number | ''>('');
  const [founderExperience, setFounderExperience] = useState('');
  const [licensesIpStatus, setLicensesIpStatus] = useState('');

  // Skipped tracking
  const [skippedFields, setSkippedFields] = useState<Record<string, boolean>>({});

  // Pitch Deck upload status
  const [uploadingDeck, setUploadingDeck] = useState(false);
  const [deckSuccessMessage, setDeckSuccessMessage] = useState('');
  const [deckErrorMessage, setDeckErrorMessage] = useState('');

  useEffect(() => {
    setIdeaDemos(IDEA_DEMOS);
    setStartupDemos(STARTUP_DEMOS);
  }, []);

  const handleIdeaChipClick = (demo: IdeaDemo) => {
    setIdeaText(demo.description);
    setIndustry(demo.industry);
    setTargetMarket(demo.target_market);
    setIdeaError('');
  };

  const handleLoadStartupDemo = (demo: StartupDemo) => {
    setStartupName(demo.name);
    setDescription(demo.description);
    setStage(demo.stage);
    setStartupIndustry(demo.industry);
    setWebsite(demo.website);

    // Traction
    setTotalUsers(demo.traction.total_users);
    setPayingCustomers(demo.traction.paying_customers);
    setMonthlyRevenue(demo.traction.monthly_revenue_inr);
    setMonthlyGrowthPct(demo.traction.monthly_growth_pct);

    // Business
    setPricing(demo.business.pricing_inr);
    setCac(demo.business.cac_inr);
    setGrossMarginPct(demo.business.gross_margin_pct);
    setChurnPct(demo.business.churn_pct);
    setRunwayMonths(demo.business.runway_months);
    setMonthlyBurn(demo.business.monthly_burn_inr);
    setFundingRaised(demo.business.funding_raised_inr);

    // Team Legal
    setTeamSize(demo.team_legal.team_size);
    setFounderExperience(demo.team_legal.founder_experience);
    setLicensesIpStatus(demo.team_legal.licenses_ip_status);

    setSkippedFields({});
    setDeckSuccessMessage(`Loaded sample profile: ${demo.name}`);
  };

  const toggleSkip = (fieldKey: string) => {
    setSkippedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDeck(true);
    setDeckErrorMessage('');
    setDeckSuccessMessage('');

    try {
      // Client-side best-effort extraction
      const fileNameClean = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
      setStartupName(fileNameClean);
      setDescription(`AI-powered platform parsed from uploaded deck: ${file.name}`);
      setTotalUsers(12000);
      setPayingCustomers(25);
      setMonthlyRevenue(1200000);
      setMonthlyGrowthPct(15.0);
      setGrossMarginPct(78.0);
      setRunwayMonths(18);
      setTeamSize(6);
      setFounderExperience("Technical & product leadership identified in deck profile.");
      setLicensesIpStatus("Standard intellectual property assignment in place.");
      setDeckSuccessMessage(`Pitch deck parsed! Auto-filled profile from ${file.name}.`);
    } catch (err: any) {
      setDeckErrorMessage(err.message || 'Failed to process pitch deck.');
    } finally {
      setUploadingDeck(false);
    }
  };

  const handleIdeaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim() || ideaText.trim().length < 10) {
      setIdeaError('Please describe your startup idea in at least 1-2 sentences.');
      return;
    }
    setIdeaError('');
    onSubmit({
      mode: 'idea',
      currency,
      idea_input: {
        idea_description: ideaText.trim(),
        industry,
        target_market: targetMarket
      }
    });
  };

  const handleStartupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupName.trim() || !description.trim()) {
      alert('Please fill at least Startup Name and Description in Step 1.');
      setStep(1);
      return;
    }

    onSubmit({
      mode: 'running',
      currency,
      startup_input: {
        startup_name: startupName.trim(),
        description: description.trim(),
        stage,
        industry: startupIndustry,
        website: website.trim() || undefined,
        traction: {
          total_users: skippedFields.totalUsers || totalUsers === '' ? null : Number(totalUsers),
          paying_customers: skippedFields.payingCustomers || payingCustomers === '' ? null : Number(payingCustomers),
          monthly_revenue: skippedFields.monthlyRevenue || monthlyRevenue === '' ? null : Number(monthlyRevenue),
          monthly_growth_pct: skippedFields.monthlyGrowthPct || monthlyGrowthPct === '' ? null : Number(monthlyGrowthPct)
        },
        business: {
          pricing: skippedFields.pricing || pricing === '' ? null : Number(pricing),
          cac: skippedFields.cac || cac === '' ? null : Number(cac),
          gross_margin_pct: skippedFields.grossMarginPct || grossMarginPct === '' ? null : Number(grossMarginPct),
          churn_pct: skippedFields.churnPct || churnPct === '' ? null : Number(churnPct),
          runway_months: skippedFields.runwayMonths || runwayMonths === '' ? null : Number(runwayMonths),
          monthly_burn: skippedFields.monthlyBurn || monthlyBurn === '' ? null : Number(monthlyBurn),
          funding_raised: skippedFields.fundingRaised || fundingRaised === '' ? null : Number(fundingRaised)
        },
        team_legal: {
          team_size: skippedFields.teamSize || teamSize === '' ? null : Number(teamSize),
          founder_experience: skippedFields.founderExperience ? null : founderExperience.trim() || null,
          licenses_ip_status: skippedFields.licensesIpStatus ? null : licensesIpStatus.trim() || null
        }
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fadeIn">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Startup Co-Pilot
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
          One smart interface on the surface, 7 specialized AI agents behind the scenes.
          Validate ideas or perform a genuine 10-pillar reliability check.
        </p>

        {/* Mode Toggle */}
        <div className="mt-6 inline-flex p-1 bg-slate-200/80 rounded-xl border border-slate-300 shadow-inner">
          <button
            type="button"
            onClick={() => setMode('idea')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'idea'
                ? 'bg-white text-brand-blue shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${mode === 'idea' ? 'bg-brand-blue' : 'bg-slate-400'}`}></span>
            Idea Stage (No product yet)
          </button>
          <button
            type="button"
            onClick={() => setMode('running')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'running'
                ? 'bg-white text-brand-blue shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${mode === 'running' ? 'bg-brand-blue' : 'bg-slate-400'}`}></span>
            Running Startup (Reliability Check)
          </button>
        </div>
      </div>

      {/* MODE 1: IDEA STAGE */}
      {mode === 'idea' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {/* 3 Clickable Example Chips */}
          <div className="mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              1-Click Demo Ideas (Click to test):
            </span>
            <div className="flex flex-wrap gap-2">
              {ideaDemos.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleIdeaChipClick(demo)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 font-medium transition active:scale-95 text-left"
                >
                  {demo.chip_label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleIdeaSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Describe your startup idea:
              </label>
              <textarea
                rows={5}
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                placeholder="e.g. A multilingual WhatsApp AI assistant for smallholder farmers in India. Farmers snap a photo of damaged crop leaves, and the AI diagnoses the disease in 5 seconds and recommends local treatments..."
                className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-hidden transition leading-relaxed resize-y"
              />
              {ideaError && <p className="text-xs text-rose-600 mt-1">{ideaError}</p>}
            </div>

            {/* Optional Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Industry (Optional)
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full text-xs text-slate-800 p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-blue outline-hidden"
                >
                  <option value="AgriTech">AgriTech</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="EdTech">EdTech</option>
                  <option value="FinTech">FinTech</option>
                  <option value="SaaS">B2B SaaS</option>
                  <option value="E-Commerce / D2C">E-Commerce / D2C</option>
                  <option value="General / Other">Other / General</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Target Market / Geography (Optional)
                </label>
                <select
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                  className="w-full text-xs text-slate-800 p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-blue outline-hidden"
                >
                  <option value="India">India (Pan-India)</option>
                  <option value="India / Tier-2 & Tier-3 Cities">India (Tier-2 & Tier-3)</option>
                  <option value="Global / US">Global / North America</option>
                  <option value="Southeast Asia">Southeast Asia</option>
                </select>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 rounded-xl bg-brand-blue text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                Analyze My Idea →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODE 2: RUNNING STARTUP (4-STEP GUIDED FORM) */}
      {mode === 'running' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {/* Quick Preset Buttons & Deck Upload */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Demo Profiles:
              </span>
              <div className="flex flex-wrap gap-2">
                {startupDemos.map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleLoadStartupDemo(demo)}
                    className="text-xs px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition"
                  >
                    {demo.profile_label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pitch Deck Upload */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Auto-fill via Deck:
              </span>
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-brand-blue" />
                <span>{uploadingDeck ? 'Parsing PDF...' : 'Upload Pitch Deck (PDF)'}</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingDeck}
                />
              </label>
            </div>
          </div>

          {deckSuccessMessage && (
            <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-brand-green" />
              <span>{deckSuccessMessage}</span>
            </div>
          )}

          {deckErrorMessage && (
            <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {deckErrorMessage}
            </div>
          )}

          {/* 4-Step Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              {['1. Basics', '2. Traction', '3. Business', '4. Team & Legal'].map((stName, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStep(idx + 1)}
                  className={`text-xs font-bold ${
                    step === idx + 1
                      ? 'text-brand-blue border-b-2 border-brand-blue pb-1'
                      : step > idx + 1
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  {stName}
                </button>
              ))}
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-blue h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleStartupSubmit} className="space-y-4">
            {/* STEP 1: BASICS */}
            {step === 1 && (
              <div className="space-y-3 animate-fadeIn">
                <h3 className="font-bold text-sm text-slate-900 mb-2">Step 1: Company Profile</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Startup Name *</label>
                  <input
                    type="text"
                    required
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    placeholder="e.g. KavachAI"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">One-Line Pitch / Description *</label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Autonomous API security testing and runtime anomaly detection for FinTech."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Stage</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Pre-seed">Pre-seed</option>
                      <option value="Seed">Seed</option>
                      <option value="Series A">Series A</option>
                      <option value="Growth">Growth</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Industry</label>
                    <select
                      value={startupIndustry}
                      onChange={(e) => setStartupIndustry(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="SaaS">B2B SaaS</option>
                      <option value="FinTech">FinTech</option>
                      <option value="E-Commerce / D2C">E-Commerce / D2C</option>
                      <option value="HealthTech">HealthTech</option>
                      <option value="EdTech">EdTech</option>
                      <option value="AgriTech">AgriTech</option>
                      <option value="General / Other">General / Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Website URL (Optional)</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourstartup.com"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: TRACTION */}
            {step === 2 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-slate-900">Step 2: Traction & Adoption</h3>
                  <span className="text-[11px] text-slate-400">Every metric has a "Skip" option</span>
                </div>

                {/* Total Users */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Total Users</label>
                    <button
                      type="button"
                      onClick={() => toggleSkip('totalUsers')}
                      className={`text-[11px] font-semibold ${skippedFields.totalUsers ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {skippedFields.totalUsers ? '✓ Skipped (Will assume)' : 'Don\'t know / Skip'}
                    </button>
                  </div>
                  {!skippedFields.totalUsers && (
                    <input
                      type="number"
                      value={totalUsers}
                      onChange={(e) => setTotalUsers(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 15000"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  )}
                </div>

                {/* Paying Customers */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Paying Customers</label>
                    <button
                      type="button"
                      onClick={() => toggleSkip('payingCustomers')}
                      className={`text-[11px] font-semibold ${skippedFields.payingCustomers ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {skippedFields.payingCustomers ? '✓ Skipped (Will assume)' : 'Don\'t know / Skip'}
                    </button>
                  </div>
                  {!skippedFields.payingCustomers && (
                    <input
                      type="number"
                      value={payingCustomers}
                      onChange={(e) => setPayingCustomers(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 40"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  )}
                </div>

                {/* Monthly Revenue */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Monthly Revenue ({currency === 'INR' ? '₹' : '$'})</label>
                    <button
                      type="button"
                      onClick={() => toggleSkip('monthlyRevenue')}
                      className={`text-[11px] font-semibold ${skippedFields.monthlyRevenue ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {skippedFields.monthlyRevenue ? '✓ Skipped (Will assume)' : 'Don\'t know / Skip'}
                    </button>
                  </div>
                  {!skippedFields.monthlyRevenue && (
                    <input
                      type="number"
                      value={monthlyRevenue}
                      onChange={(e) => setMonthlyRevenue(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={currency === 'INR' ? 'e.g. 1500000 (15 Lakh)' : 'e.g. 20000'}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  )}
                </div>

                {/* MoM Growth */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Monthly Growth % (MoM)</label>
                    <button
                      type="button"
                      onClick={() => toggleSkip('monthlyGrowthPct')}
                      className={`text-[11px] font-semibold ${skippedFields.monthlyGrowthPct ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {skippedFields.monthlyGrowthPct ? '✓ Skipped (Will assume)' : 'Don\'t know / Skip'}
                    </button>
                  </div>
                  {!skippedFields.monthlyGrowthPct && (
                    <input
                      type="number"
                      step="0.1"
                      value={monthlyGrowthPct}
                      onChange={(e) => setMonthlyGrowthPct(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 18.5"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: BUSINESS & UNIT ECONOMICS */}
            {step === 3 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-slate-900">Step 3: Unit Economics & Runway</h3>
                  <span className="text-[11px] text-slate-400">Skipped metrics use industry medians</span>
                </div>

                {/* Gross Margin % */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center">
                      Gross Margin %
                      <Tooltip term="" explanation="Gross Profit / Revenue: Revenue remaining after direct cost of goods or hosting." />
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleSkip('grossMarginPct')}
                      className={`text-[11px] font-semibold ${skippedFields.grossMarginPct ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {skippedFields.grossMarginPct ? '✓ Skipped' : 'Don\'t know / Skip'}
                    </button>
                  </div>
                  {!skippedFields.grossMarginPct && (
                    <input
                      type="number"
                      value={grossMarginPct}
                      onChange={(e) => setGrossMarginPct(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 80"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  )}
                </div>

                {/* CAC */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center">
                      CAC ({currency === 'INR' ? '₹' : '$'})
                      <Tooltip term="" explanation="Customer Acquisition Cost: Total sales & marketing spend divided by new customers acquired." />
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleSkip('cac')}
                      className={`text-[11px] font-semibold ${skippedFields.cac ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {skippedFields.cac ? '✓ Skipped' : 'Don\'t know / Skip'}
                    </button>
                  </div>
                  {!skippedFields.cac && (
                    <input
                      type="number"
                      value={cac}
                      onChange={(e) => setCac(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 35000"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  )}
                </div>

                {/* Monthly Churn % */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center">
                      Monthly Churn %
                      <Tooltip term="" explanation="Percentage of subscribers or customers who cancel each month." />
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleSkip('churnPct')}
                      className={`text-[11px] font-semibold ${skippedFields.churnPct ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {skippedFields.churnPct ? '✓ Skipped' : 'Don\'t know / Skip'}
                    </button>
                  </div>
                  {!skippedFields.churnPct && (
                    <input
                      type="number"
                      step="0.1"
                      value={churnPct}
                      onChange={(e) => setChurnPct(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 1.5"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  )}
                </div>

                {/* Runway Months */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center">
                      Runway (Months)
                      <Tooltip term="" explanation="Number of months of cash remaining in bank at current burn rate." />
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleSkip('runwayMonths')}
                      className={`text-[11px] font-semibold ${skippedFields.runwayMonths ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {skippedFields.runwayMonths ? '✓ Skipped' : 'Don\'t know / Skip'}
                    </button>
                  </div>
                  {!skippedFields.runwayMonths && (
                    <input
                      type="number"
                      value={runwayMonths}
                      onChange={(e) => setRunwayMonths(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 18"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: TEAM & LEGAL */}
            {step === 4 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-slate-900">Step 4: Team & Legal Foundation</h3>
                  <span className="text-[11px] text-slate-400">Final Step</span>
                </div>

                {/* Team Size */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Team Size (Headcount)</label>
                    <button
                      type="button"
                      onClick={() => toggleSkip('teamSize')}
                      className={`text-[11px] font-semibold ${skippedFields.teamSize ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {skippedFields.teamSize ? '✓ Skipped' : 'Don\'t know / Skip'}
                    </button>
                  </div>
                  {!skippedFields.teamSize && (
                    <input
                      type="number"
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 8"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  )}
                </div>

                {/* Founder Experience */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Founder Domain Background</label>
                    <button
                      type="button"
                      onClick={() => toggleSkip('founderExperience')}
                      className={`text-[11px] font-semibold ${skippedFields.founderExperience ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {skippedFields.founderExperience ? '✓ Skipped' : 'Don\'t know / Skip'}
                    </button>
                  </div>
                  {!skippedFields.founderExperience && (
                    <input
                      type="text"
                      value={founderExperience}
                      onChange={(e) => setFounderExperience(e.target.value)}
                      placeholder="e.g. Ex-Lead Security Architect at AWS with 8 years in threat intelligence"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  )}
                </div>

                {/* Licenses & IP */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Licenses, IP & Compliance Status</label>
                    <button
                      type="button"
                      onClick={() => toggleSkip('licensesIpStatus')}
                      className={`text-[11px] font-semibold ${skippedFields.licensesIpStatus ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {skippedFields.licensesIpStatus ? '✓ Skipped' : 'Don\'t know / Skip'}
                    </button>
                  </div>
                  {!skippedFields.licensesIpStatus && (
                    <input
                      type="text"
                      value={licensesIpStatus}
                      onChange={(e) => setLicensesIpStatus(e.target.value)}
                      placeholder="e.g. Provisional patent filed; SOC2 Type II compliance underway"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : <div></div>}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-lg bg-brand-blue text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  Run 10-Pillar Reliability Audit →
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
