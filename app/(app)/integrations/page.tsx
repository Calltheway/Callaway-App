'use client';

import { useState } from 'react';
import { Lock, RefreshCw, Check, AlertCircle, Clock, Mail, Calendar, CreditCard, Heart, Shield } from 'lucide-react';

interface Integration {
  id:          string;
  type:        string;
  name:        string;
  description: string;
  icon:        React.ReactNode;
  status:      'connected' | 'disconnected' | 'syncing' | 'error';
  lastSynced?: string;
  dataPoints:  string[];
  connectUrl?: string;
  syncRoute:   string;
}

const INTEGRATIONS: Integration[] = [
  {
    id:          'gmail',
    type:        'gmail',
    name:        'Gmail',
    description: 'Email Intelligence',
    icon:        <Mail size={28} className="text-oracle-teal" />,
    status:      'disconnected',
    dataPoints:  [
      'Sender frequency & relationship mapping',
      'Stress keyword detection in emails',
      'Commitment & follow-up pattern tracking',
    ],
    connectUrl:  '/api/auth/google?scope=gmail',
    syncRoute:   '/api/integrations/gmail/sync',
  },
  {
    id:          'calendar',
    type:        'calendar',
    name:        'Google Calendar',
    description: 'Calendar Analysis',
    icon:        <Calendar size={28} className="text-oracle-teal" />,
    status:      'disconnected',
    dataPoints:  [
      'Cancellation rate & social withdrawal tracking',
      'Social vs work event balance scoring',
      'Sleep window inference from schedule gaps',
    ],
    connectUrl:  '/api/auth/google?scope=calendar',
    syncRoute:   '/api/integrations/calendar/sync',
  },
  {
    id:          'plaid',
    type:        'plaid',
    name:        'Bank Accounts',
    description: 'Financial Oracle',
    icon:        <CreditCard size={28} className="text-oracle-teal" />,
    status:      'disconnected',
    dataPoints:  [
      'Transaction categorization & spending trends',
      'Savings rate calculation & improvement tracking',
      'Spending anomaly detection vs baseline',
    ],
    connectUrl:  '/api/plaid/link-token',
    syncRoute:   '/api/integrations/plaid/sync',
  },
  {
    id:          'health',
    type:        'health',
    name:        'Health & Fitness',
    description: 'Health Intelligence',
    icon:        <Heart size={28} className="text-oracle-teal" />,
    status:      'disconnected',
    dataPoints:  [
      'Sleep quality & duration trend analysis',
      'Heart rate variability & recovery tracking',
      'Workout consistency & energy level correlation',
    ],
    connectUrl:  '/api/auth/fitbit',
    syncRoute:   '/api/integrations/health/sync',
  },
];

const STATUS_CONFIG = {
  connected:    { label: 'Connected',     className: 'bg-oracle-teal/10 text-oracle-teal border border-oracle-teal/20',    icon: Check },
  disconnected: { label: 'Not Connected', className: 'bg-oracle-muted/10 text-oracle-muted border border-oracle-border',   icon: AlertCircle },
  syncing:      { label: 'Syncing…',      className: 'bg-oracle-amber/10 text-oracle-amber border border-oracle-amber/20', icon: RefreshCw },
  error:        { label: 'Error',         className: 'bg-oracle-crimson/10 text-oracle-crimson border border-oracle-crimson/20', icon: AlertCircle },
};

function IntegrationCard({ integration }: { integration: Integration }) {
  const [status, setStatus]     = useState(integration.status);
  const [syncing, setSyncing]   = useState(false);

  const cfg       = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;

  async function handleSync() {
    setSyncing(true);
    setStatus('syncing');
    try {
      const res = await fetch(integration.syncRoute, { method: 'POST' });
      setStatus(res.ok ? 'connected' : 'error');
    } catch {
      setStatus('error');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="oracle-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-oracle-teal/10 border border-oracle-teal/20 flex items-center justify-center">
            {integration.icon}
          </div>
          <div>
            <h3 className="text-oracle-bright font-semibold">{integration.name}</h3>
            <p className="text-oracle-muted text-xs font-mono uppercase tracking-wider mt-0.5">
              {integration.description}
            </p>
          </div>
        </div>
        <span className={`text-xs font-mono px-2.5 py-1 rounded-full flex items-center gap-1.5 ${cfg.className}`}>
          <StatusIcon size={10} className={syncing ? 'animate-spin' : ''} />
          {cfg.label}
        </span>
      </div>

      {/* Data points */}
      <ul className="space-y-2">
        {integration.dataPoints.map((point) => (
          <li key={point} className="flex items-start gap-2 text-xs text-oracle-muted">
            <span className="text-oracle-teal/60 shrink-0 mt-0.5">·</span>
            {point}
          </li>
        ))}
      </ul>

      {/* Last synced */}
      {status === 'connected' && integration.lastSynced && (
        <div className="flex items-center gap-1.5 text-xs text-oracle-muted">
          <Clock size={10} />
          Last synced {integration.lastSynced}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1 border-t border-oracle-border/50">
        {status === 'connected' ? (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="oracle-btn-ghost text-sm py-2 px-4 flex items-center gap-2"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            Sync now
          </button>
        ) : (
          <a
            href={integration.connectUrl}
            className="oracle-btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
          >
            Connect {integration.name}
          </a>
        )}
        {status === 'connected' && (
          <button className="text-xs text-oracle-muted hover:text-oracle-crimson transition-colors">
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}

const PRIVACY_ITEMS = [
  'All data is encrypted at rest using AES-256',
  'Read-only access — Oracle never writes to your accounts',
  'Revoke any integration instantly at any time',
  'Your data is never sold or shared with third parties',
  'Full data deletion available in one click from your profile',
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <header>
        <p className="oracle-label mb-2">Data Connections</p>
        <h1 className="font-display text-3xl font-bold text-oracle-bright">Connect Your Life</h1>
        <p className="text-oracle-muted mt-2 max-w-xl">
          Every integration deepens Oracle's understanding of you.
          More data means more precise insights and earlier pattern detection.
        </p>
      </header>

      {/* Integration Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {INTEGRATIONS.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {/* Privacy Promise */}
      <div className="oracle-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-oracle-teal/10 flex items-center justify-center">
            <Lock size={18} className="text-oracle-teal" />
          </div>
          <div>
            <h2 className="text-oracle-bright font-semibold font-display text-xl">Privacy Promise</h2>
            <p className="text-oracle-muted text-sm">Your data stays yours. Always.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {PRIVACY_ITEMS.map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <Shield size={13} className="text-oracle-teal shrink-0 mt-0.5" />
              <span className="text-oracle-text text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
