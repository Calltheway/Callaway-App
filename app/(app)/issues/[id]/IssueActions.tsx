'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DetectedIssue } from '@/types';

const ACTION_LABELS: Record<string, string> = {
  cancel:    'Cancel Subscription',
  dispute:   'Dispute Charge',
  negotiate: 'Get Negotiation Script',
  claim:     'Claim Refund',
  review:    'Mark as Reviewed',
  switch:    'Switch Provider',
};

const ACTION_INSTRUCTIONS: Record<string, string> = {
  cancel: 'To cancel: go to the merchant\'s website → Account Settings → Subscription → Cancel. After cancelling, mark this as resolved below.',
  dispute: 'To dispute: call the number on the back of your card and say you see an unauthorized charge. Request a chargeback.',
  claim: 'Contact the merchant directly and reference your original purchase to claim your refund.',
  switch: 'Research alternative providers to find a better rate, then cancel this service.',
  review: 'Review the details above and decide if you want to take action.',
  negotiate: '',
};

export function IssueActions({ issue }: { issue: DetectedIssue }) {
  const router  = useRouter();
  const [loading,  setLoading]  = useState(false);
  const [script,   setScript]   = useState('');
  const [resolved, setResolved] = useState(false);

  const handlePrimaryAction = async () => {
    setLoading(true);
    try {
      if (issue.recommended_action === 'negotiate') {
        const res  = await fetch('/api/negotiate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            merchantName:  issue.merchant_name,
            monthlyAmount: issue.monthly_cost,
            context:       issue.plain_english_explanation,
          }),
        });
        const data = await res.json();
        setScript(data.script ?? '');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async () => {
    setLoading(true);
    try {
      await fetch(`/api/issues/${issue.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          status:      'resolved',
          amountSaved: issue.monthly_cost,
          method:      issue.recommended_action === 'cancel' ? 'cancellation'
                     : issue.recommended_action === 'dispute' ? 'dispute_won'
                     : issue.recommended_action === 'claim' ? 'refund_claimed'
                     : 'manual',
          description: `Resolved ${issue.merchant_name} issue`,
        }),
      });
      setResolved(true);
      setTimeout(() => router.push('/issues'), 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    await fetch(`/api/issues/${issue.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: 'dismissed' }),
    });
    router.push('/issues');
  };

  const instructions = ACTION_INSTRUCTIONS[issue.recommended_action];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <h2 className="font-bold text-navy-900">Take action</h2>

      {resolved ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-bold text-emerald-700">Issue resolved!</p>
          <p className="text-emerald-600 text-sm mt-1">
            ${issue.monthly_cost.toFixed(2)}/month saved. Redirecting…
          </p>
        </div>
      ) : (
        <>
          {/* Instructions */}
          {instructions && issue.recommended_action !== 'negotiate' && (
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed">
              {instructions}
            </div>
          )}

          {/* Negotiation script */}
          {script && (
            <div className="bg-navy-900 rounded-xl p-5">
              <p className="text-emerald-400 font-semibold text-sm mb-3">📞 Your negotiation script</p>
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{script}</p>
            </div>
          )}

          {/* Primary action */}
          {issue.status !== 'resolved' && issue.status !== 'dismissed' && (
            <button
              onClick={handlePrimaryAction}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : ACTION_LABELS[issue.recommended_action]}
            </button>
          )}

          {/* Mark resolved */}
          {issue.status !== 'resolved' && (
            <button
              onClick={handleMarkResolved}
              disabled={loading}
              className="w-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              ✓ I fixed this — mark as resolved (+${issue.monthly_cost.toFixed(2)} saved)
            </button>
          )}

          {/* Dismiss */}
          {issue.status !== 'dismissed' && issue.status !== 'resolved' && (
            <button
              onClick={handleDismiss}
              className="w-full text-slate-400 hover:text-slate-600 py-2 text-sm transition-colors"
            >
              Dismiss this issue
            </button>
          )}
        </>
      )}
    </div>
  );
}
