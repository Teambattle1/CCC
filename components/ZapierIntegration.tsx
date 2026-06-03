import React, { useState, useEffect } from 'react';
import {
  Zap,
  RefreshCw,
  Copy,
  Check,
  KeyRound,
  PlusCircle,
  RefreshCcw,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ZAPIER_WEBHOOK_URL,
  ZAPIER_FIELD_MAP,
  fetchZapierLog,
  type ZapierWebhookLog,
} from '../lib/zapier';

const STATUS_STYLES: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  inserted: { color: 'text-green-400 bg-green-500/20 border-green-500/30', icon: <PlusCircle className="w-4 h-4" />, label: 'Oprettet' },
  updated: { color: 'text-blue-400 bg-blue-500/20 border-blue-500/30', icon: <RefreshCcw className="w-4 h-4" />, label: 'Opdateret' },
  failed: { color: 'text-red-400 bg-red-500/20 border-red-500/30', icon: <XCircle className="w-4 h-4" />, label: 'Fejlede' },
  rejected: { color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30', icon: <AlertTriangle className="w-4 h-4" />, label: 'Afvist' },
};

const ZapierIntegration: React.FC = () => {
  const [logs, setLogs] = useState<ZapierWebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    setLogs(await fetchZapierLog(50));
    setIsLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const copyUrl = () => {
    navigator.clipboard.writeText(ZAPIER_WEBHOOK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString('da-DK', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="space-y-4 tablet:space-y-6">
      {/* Header */}
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-4 tablet:p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-battle-orange/20 rounded-xl border border-battle-orange/30">
            <Zap className="w-6 h-6 tablet:w-8 tablet:h-8 text-battle-orange" />
          </div>
          <div>
            <h2 className="text-lg tablet:text-xl font-bold text-white uppercase tracking-wider">
              Zapier Integration
            </h2>
            <p className="text-xs tablet:text-sm text-battle-orange">
              Indgående jobs / bookinger → CCC
            </p>
          </div>
        </div>
      </div>

      {/* Webhook endpoint */}
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-4 tablet:p-6 backdrop-blur-sm space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Webhook URL</h3>
        <p className="text-xs text-gray-400">
          Opret en <span className="text-white">Webhooks by Zapier → POST</span> action i din Zap, og send job-data hertil.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-battle-black/50 border border-white/20 rounded-lg px-3 py-2 text-xs text-green-400 break-all">
            {ZAPIER_WEBHOOK_URL}
          </code>
          <button
            onClick={copyUrl}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors shrink-0"
            title="Kopiér URL"
          >
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-white" />}
          </button>
        </div>

        <div className="flex items-start gap-2 pt-2">
          <KeyRound className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-400">
            Tilføj header <code className="text-yellow-400">x-zapier-secret</code> med den hemmelige nøgle
            (sat som <code className="text-white">ZAPIER_WEBHOOK_SECRET</code> i Supabase Edge Function secrets).
            Uden korrekt nøgle afvises kaldet.
          </p>
        </div>
      </div>

      {/* Field mapping (collapsible) */}
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl backdrop-blur-sm overflow-hidden">
        <button
          onClick={() => setShowMapping((v) => !v)}
          className="w-full flex items-center justify-between p-4 tablet:p-6 text-left"
        >
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Felt-mapping</h3>
          {showMapping ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {showMapping && (
          <div className="px-4 pb-4 tablet:px-6 tablet:pb-6 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-500 border-b border-white/10">
                  <th className="py-2 pr-4 font-medium">Felt (kolonne)</th>
                  <th className="py-2 pr-4 font-medium">Aliaser</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 font-medium">Beskrivelse</th>
                </tr>
              </thead>
              <tbody>
                {ZAPIER_FIELD_MAP.map((f) => (
                  <tr key={f.field} className="border-b border-white/5">
                    <td className="py-2 pr-4 text-white font-mono whitespace-nowrap">{f.field}</td>
                    <td className="py-2 pr-4 text-gray-400 font-mono">{f.aliases.join(', ') || '—'}</td>
                    <td className="py-2 pr-4 text-battle-orange whitespace-nowrap">{f.type}</td>
                    <td className="py-2 text-gray-300">{f.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-3">
              Jobs matches på <code className="text-white">opgave_id</code> (ellers <code className="text-white">short_code</code>):
              findes et match opdateres rækken, ellers oprettes et nyt job.
            </p>
          </div>
        )}
      </div>

      {/* Recent deliveries */}
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-4 tablet:p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Seneste leverancer</h3>
          <button
            onClick={loadLogs}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            title="Opdatér"
          >
            <RefreshCw className={`w-5 h-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Henter…</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Ingen leverancer endnu. Send en test fra Zapier for at se den her.
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const s = STATUS_STYLES[log.status] ?? STATUS_STYLES.failed;
              const expanded = expandedId === log.id;
              return (
                <div key={log.id} className="bg-battle-black/30 border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expanded ? null : log.id)}
                    className="w-full flex items-center justify-between gap-2 p-3 text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${s.color}`}>
                        {s.icon}
                        {s.label}
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        {log.opgave_id ? `#${log.opgave_id}` : log.task_job_id ? log.task_job_id.slice(0, 8) : '—'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{fmtDate(log.created_at)}</span>
                  </button>
                  {expanded && (
                    <div className="px-3 pb-3 border-t border-white/10 pt-3 space-y-2">
                      {log.error && (
                        <div className="text-xs text-red-400 bg-red-500/10 rounded p-2">{log.error}</div>
                      )}
                      <pre className="text-[10px] text-gray-400 bg-battle-black/50 rounded p-2 overflow-x-auto">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ZapierIntegration;
