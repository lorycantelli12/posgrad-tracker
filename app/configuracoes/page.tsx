"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type FrequenciaDigest = "diario" | "semanal" | "nunca";

const OPCOES_PAUSA = [
  { label: "7 dias", dias: 7 },
  { label: "30 dias", dias: 30 },
  { label: "90 dias", dias: 90 },
  { label: "Indefinidamente", dias: 0 },
];

const OPCOES_DIGEST: { label: string; value: FrequenciaDigest }[] = [
  { label: "Diário", value: "diario" },
  { label: "Semanal", value: "semanal" },
  { label: "Nunca", value: "nunca" },
];

function lerSS(key: string, fallback: string): string {
  try { return sessionStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function salvarSS(key: string, value: string) {
  try { sessionStorage.setItem(key, value); } catch { /* SSR */ }
}

export default function ConfiguracoesPage() {
  const [notifPausada, setNotifPausada] = useState(false);
  const [digest, setDigest] = useState<FrequenciaDigest>(() => lerSS("posgrad_digest", "semanal") as FrequenciaDigest);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [pausedMsg, setPausedMsg] = useState("");

  function calcularDataPausa(dias: number): string {
    if (dias === 0) return "9999-12-31";
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return d.toISOString();
  }

  function handlePausar(dias: number) {
    setNotifPausada(true);
    const label = dias === 0 ? "indefinidamente" : `por ${dias} dias`;
    setPausedMsg(`Notificações pausadas ${label}.`);
    salvarSS("posgrad_notif_pausa_ate", calcularDataPausa(dias));
  }

  function handleReativar() {
    setNotifPausada(false);
    setPausedMsg("");
    salvarSS("posgrad_notif_pausa_ate", "");
  }

  function handleDigest(v: FrequenciaDigest) {
    setDigest(v);
    salvarSS("posgrad_digest", v);
  }

  function handleDeletarConta() {
    // Limpa tudo do sessionStorage
    try { sessionStorage.clear(); } catch { /* */ }
    setDeleted(true);
  }

  if (deleted) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Conta removida</h2>
          <p className="text-gray-500 text-sm mb-6">Seus dados foram apagados. Obrigado por usar o PosGrad Tracker!</p>
          <Link href="/" className="text-blue-900 text-sm underline">Voltar para o início</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Voltar</Link>
          <span className="font-semibold text-gray-900">Configurações</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Preferências de conteúdo */}
        <Link href="/preferencias" className="block bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Minhas preferências</p>
              <p className="text-sm text-gray-500">Alterar área, estados e nível de interesse</p>
            </div>
            <span className="text-gray-400">→</span>
          </div>
        </Link>

        {/* Pausar notificações */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-1">Pausar notificações push</h2>
          {notifPausada ? (
            <div>
              <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-3">{pausedMsg}</p>
              <Button variant="outline" size="sm" onClick={handleReativar}>
                Reativar notificações
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">Precisa de uma pausa? Escolha por quanto tempo:</p>
              <div className="flex flex-wrap gap-2">
                {OPCOES_PAUSA.map((op) => (
                  <button
                    key={op.dias}
                    onClick={() => handlePausar(op.dias)}
                    className="px-3 py-1.5 rounded-full text-sm border border-gray-200 bg-gray-50 hover:border-amber-400 hover:text-amber-700 transition-colors"
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Digest */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-1">Frequência do resumo (digest)</h2>
          <p className="text-sm text-gray-500 mb-3">Email com os principais editais da semana</p>
          <div className="flex gap-2">
            {OPCOES_DIGEST.map((op) => (
              <button
                key={op.value}
                onClick={() => handleDigest(op.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  digest === op.value
                    ? "bg-blue-900 text-white border-blue-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cancelar conta */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-1">Cancelar conta</h2>
          <p className="text-sm text-gray-500 mb-3">Remove todos os seus dados e preferências.</p>
          {!confirmDelete ? (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setConfirmDelete(true)}
            >
              Cancelar conta
            </Button>
          ) : (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-sm text-red-700 mb-3 font-medium">Tem certeza? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeletarConta}
                >
                  Sim, cancelar conta
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Não, voltar
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
