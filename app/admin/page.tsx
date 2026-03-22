import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

async function getStats() {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  const hoje = new Date().toISOString().split("T")[0];

  const [{ count: total }, { data: porFonte }, { data: proximos }, { data: recentes }] =
    await Promise.all([
      sb.from("editais").select("*", { count: "exact", head: true }),
      sb.from("editais").select("fonte").gte("prazo_inscricao", hoje),
      sb
        .from("editais")
        .select("id,programa_nome,ies_sigla,nivel,prazo_inscricao,fonte,internacional")
        .gte("prazo_inscricao", hoje)
        .order("prazo_inscricao", { ascending: true })
        .limit(10),
      sb
        .from("editais")
        .select("id,programa_nome,ies_sigla,nivel,prazo_inscricao,fonte,internacional")
        .gte("prazo_inscricao", hoje)
        .order("prazo_inscricao", { ascending: false })
        .limit(30),
    ]);

  // Contar por fonte
  const fonteMap: Record<string, number> = {};
  for (const row of porFonte ?? []) {
    const f = (row.fonte as string) || "sem_fonte";
    fonteMap[f] = (fonteMap[f] ?? 0) + 1;
  }

  return { total, fonteMap, proximos: proximos ?? [], recentes: recentes ?? [] };
}

export default async function AdminPage() {
  const stats = await getStats();

  if (!stats) {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Admin — PosGrad Tracker</h1>
        <p className="text-gray-500">Supabase não configurado.</p>
      </main>
    );
  }

  const { total, fonteMap, proximos, recentes } = stats;
  const hoje = new Date().toISOString().split("T")[0];
  const abertos = Object.values(fonteMap).reduce((a, b) => a + b, 0);

  return (
    <main className="p-6 max-w-4xl mx-auto font-mono text-sm">
      <h1 className="text-xl font-bold mb-6">🎓 PosGrad — Admin</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat label="Total no banco" value={total ?? 0} />
        <Stat label="Com prazo aberto" value={abertos} />
        <Stat label="Internacionais" value={fonteMap["euraxess"] ?? 0 + (fonteMap["internacional"] ?? 0)} />
        <Stat label="Encerram em 7d" value={proximos.filter((e) => {
          const d = new Date(e.prazo_inscricao as string).getTime() - Date.now();
          return d > 0 && d <= 7 * 86400_000;
        }).length} />
      </div>

      {/* Por fonte */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2 text-xs uppercase tracking-wide text-gray-500">Por fonte (abertos)</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(fonteMap).sort((a, b) => b[1] - a[1]).map(([fonte, qtd]) => (
            <span key={fonte} className="bg-gray-100 px-3 py-1 rounded text-xs">
              {fonte}: <strong>{qtd}</strong>
            </span>
          ))}
        </div>
      </section>

      {/* Encerrando em breve */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2 text-xs uppercase tracking-wide text-gray-500">Encerrando em breve</h2>
        <EditaisTable rows={proximos} />
      </section>

      {/* Todos abertos */}
      <section>
        <h2 className="font-semibold mb-2 text-xs uppercase tracking-wide text-gray-500">Abertos recentes (top 30 por prazo)</h2>
        <EditaisTable rows={recentes} />
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-gray-200 rounded p-3">
      <div className="text-2xl font-bold text-blue-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function EditaisTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (!rows.length) return <p className="text-gray-400 text-xs">Nenhum.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b text-left text-gray-400">
            <th className="py-1 pr-3">Prazo</th>
            <th className="py-1 pr-3">Programa</th>
            <th className="py-1 pr-3">IES</th>
            <th className="py-1 pr-3">Nível</th>
            <th className="py-1">Fonte</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => {
            const dias = Math.ceil(
              (new Date(e.prazo_inscricao as string).getTime() - Date.now()) / 86400_000
            );
            return (
              <tr key={e.id as string} className="border-b border-gray-50 hover:bg-gray-50">
                <td className={`py-1 pr-3 ${dias <= 7 ? "text-red-600 font-semibold" : dias <= 30 ? "text-amber-600" : "text-gray-500"}`}>
                  {e.prazo_inscricao as string} ({dias}d)
                </td>
                <td className="py-1 pr-3 max-w-xs truncate">{e.programa_nome as string}</td>
                <td className="py-1 pr-3">{e.ies_sigla as string}</td>
                <td className="py-1 pr-3">{e.nivel as string}</td>
                <td className="py-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    e.fonte === "euraxess" ? "bg-blue-100 text-blue-700" :
                    e.internacional ? "bg-purple-100 text-purple-700" :
                    e.fonte === "dou" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {e.fonte as string}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
