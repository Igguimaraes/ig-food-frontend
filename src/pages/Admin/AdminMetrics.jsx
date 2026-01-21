// src/pages/Admin/AdminMetrics.jsx
import { useMemo, useState } from "react";
import { api } from "../../services/api";

export default function AdminMetrics() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatBRL = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "R$ 0,00";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const cards = useMemo(() => {
    if (!metrics) return null;
    return {
      day: metrics.day || null,
      week: metrics.week || null,
      month: metrics.month || null,
    };
  }, [metrics]);

  const load = async ({ pinOverride } = {}) => {
    setError("");
    setLoading(true);

    const effectivePin = typeof pinOverride === "string" ? pinOverride : pin;

    // IMPORTANTe: não chama API sem PIN
    if (!effectivePin) {
      setUnlocked(false);
      setMetrics(null);
      setError("Digite o PIN para ver o faturamento.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/admin/metrics/revenue", {
        headers: { "x-admin-pin": effectivePin },
      });

      setMetrics(data || null);
      setUnlocked(true);
      if (pinOverride) setPin(pinOverride);
    } catch (err) {
      const status = err?.response?.status;

      if (status === 403) {
        setUnlocked(false);
        setMetrics(null);
        setError("PIN inválido. Tente novamente.");
      } else {
        setError(
          err?.response?.data?.message || "Erro ao carregar faturamento."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const unlock = async () => {
    await load({ pinOverride: pin });
  };

  const onRefresh = () => {
    if (!unlocked) {
      setError("Digite o PIN para ver o faturamento.");
      return;
    }
    load();
  };

  const lock = () => {
    setUnlocked(false);
    setMetrics(null);
    setPin("");
    setError("");
  };

  return (
    <section className="adm-card">
      <div className="adm-cardTop">
        <div>
          <div className="adm-cardTitle">Faturamento</div>
          <div className="adm-cardSub">Resumo do dia, semana e mês</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="adm-btn adm-btn--ghost"
            type="button"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? "Atualizando..." : "Atualizar"}
          </button>

          {unlocked && (
            <button
              className="adm-btn adm-btn--danger"
              type="button"
              onClick={lock}
              disabled={loading}
            >
              Bloquear
            </button>
          )}
        </div>
      </div>

      {!unlocked && (
        <div style={{ marginTop: "var(--space-md)", display: "grid", gap: 10 }}>
          <div className="adm-muted">
            Área sensível: informe o PIN para liberar as métricas.
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              className="adm-input"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN do faturamento"
            />

            <button
              className="adm-btn adm-btn--primary"
              type="button"
              onClick={unlock}
              disabled={!pin || loading}
            >
              {loading ? "Verificando..." : "Liberar"}
            </button>
          </div>
        </div>
      )}

      {error && <div className="adm-error">{error}</div>}

      {!unlocked ? (
        <div className="adm-empty">
          Bloqueado. Informe o PIN para visualizar.
        </div>
      ) : loading ? (
        <div className="adm-loading">Carregando métricas...</div>
      ) : !cards ? (
        <div className="adm-empty">Sem dados de faturamento.</div>
      ) : (
        <div className="adm-metrics" style={{ marginTop: "var(--space-md)" }}>
          <div className="adm-metric">
            <div className="adm-metricLabel">Hoje</div>
            <div className="adm-metricValue">
              {formatBRL(cards.day?.revenue)}
            </div>
            <div className="adm-metricHint">
              {cards.day?.orders ?? 0} pedido(s)
            </div>
          </div>

          <div className="adm-metric">
            <div className="adm-metricLabel">Semana</div>
            <div className="adm-metricValue">
              {formatBRL(cards.week?.revenue)}
            </div>
            <div className="adm-metricHint">
              {cards.week?.orders ?? 0} pedido(s)
            </div>
          </div>

          <div className="adm-metric">
            <div className="adm-metricLabel">Mês</div>
            <div className="adm-metricValue">
              {formatBRL(cards.month?.revenue)}
            </div>
            <div className="adm-metricHint">
              {cards.month?.orders ?? 0} pedido(s)
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
