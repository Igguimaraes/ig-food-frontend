// src/pages/Admin/AdminOrders.jsx
import "./AdminOrders.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../services/api";
import { session } from "../../utils/session";
import { useNavigate } from "react-router-dom";
import AdminOrder from "../../components/AdminOrder/AdminOrder";

const POLL_MS = 6000;

const nextStatusMap = {
  RECEBIDO: "PREPARANDO",
  PREPARANDO: "PRONTO",
  PRONTO: "ENTREGUE",
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const aliveRef = useRef(true);

  const [metricsPin, setMetricsPin] = useState("");
  const [askPin, setAskPin] = useState(false);
  const [metricsUnlocked, setMetricsUnlocked] = useState(false);

  const [openOrders, setOpenOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState("");

  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false); // começa false (não tenta sem PIN)
  const [errorMetrics, setErrorMetrics] = useState("");

  const [busyId, setBusyId] = useState(null);

  const formatBRL = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "R$ 0,00";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const ensureAdmin = () => {
    const token = session.getToken();
    const user = session.getUser();

    if (!token) {
      navigate("/login", { replace: true, state: { from: "/admin" } });
      return false;
    }

    if (user?.role !== "ADMIN") {
      setErrorOrders("Acesso restrito: apenas administradores.");
      return false;
    }

    return true;
  };

  const loadOpenOrders = async ({ silent = false } = {}) => {
    if (!ensureAdmin()) return;

    if (!silent) setLoadingOrders(true);
    setErrorOrders("");

    try {
      const { data } = await api.get("/admin/orders/open");
      if (!aliveRef.current) return;
      setOpenOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      if (!aliveRef.current) return;
      setErrorOrders(
        err?.response?.data?.message || "Erro ao carregar pedidos."
      );
    } finally {
      if (!silent) setLoadingOrders(false);
    }
  };

  // Só carrega métricas se estiver desbloqueado OU se o usuário estiver tentando liberar com um pin
  const loadMetrics = async ({ pinOverride } = {}) => {
    if (!ensureAdmin()) return;

    const effectivePin =
      typeof pinOverride === "string"
        ? pinOverride
        : metricsUnlocked
        ? metricsPin
        : "";

    // Se não tem PIN, não chama a API (evita 403 no console)
    if (!effectivePin) {
      setMetrics(null);
      setErrorMetrics("");
      setAskPin(true);
      setMetricsUnlocked(false);
      setLoadingMetrics(false);
      return;
    }

    setLoadingMetrics(true);
    setErrorMetrics("");

    try {
      const { data } = await api.get("/admin/metrics/revenue", {
        headers: { "x-admin-pin": effectivePin },
      });

      if (!aliveRef.current) return;

      setMetrics(data || null);
      setAskPin(false);
      setMetricsUnlocked(true);

      // garante que o pin digitado fica salvo no state quando liberar
      if (pinOverride) setMetricsPin(pinOverride);
    } catch (err) {
      if (!aliveRef.current) return;

      if (err?.response?.status === 403) {
        // PIN inválido/obrigatório
        setMetrics(null);
        setMetricsUnlocked(false);
        setAskPin(true);
        setErrorMetrics("PIN inválido. Tente novamente.");
        return;
      }

      setErrorMetrics(
        err?.response?.data?.message || "Erro ao carregar faturamento."
      );
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    aliveRef.current = true;

    loadOpenOrders();
    // NÃO chama loadMetrics() aqui para não gerar 403 sem PIN
    // Apenas deixa a UI pronta para pedir PIN quando necessário.

    return () => {
      aliveRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling só dos pedidos
  useEffect(() => {
    const interval = setInterval(() => {
      loadOpenOrders({ silent: true });
    }, POLL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advanceOrder = async (order) => {
    const nextStatus = nextStatusMap[order.status];
    if (!nextStatus) return;

    if (busyId) return;
    setBusyId(order.id);

    try {
      await api.patch(`/admin/orders/${order.id}/status`, {
        status: nextStatus,
      });

      await loadOpenOrders({ silent: true });

      // só tenta métricas se já estiver liberado (evita 403)
      if (metricsUnlocked) await loadMetrics();
    } catch (err) {
      setErrorOrders(
        err?.response?.data?.message || "Erro ao atualizar status."
      );
    } finally {
      setBusyId(null);
    }
  };

  const cancelOrder = async (orderId) => {
    if (busyId) return;
    setBusyId(orderId);

    try {
      await api.patch(`/admin/orders/${orderId}/cancel`);

      await loadOpenOrders({ silent: true });

      // só tenta métricas se já estiver liberado (evita 403)
      if (metricsUnlocked) await loadMetrics();
    } catch (err) {
      setErrorOrders(
        err?.response?.data?.message || "Erro ao cancelar pedido."
      );
    } finally {
      setBusyId(null);
    }
  };

  const metricsCards = useMemo(() => {
    if (!metrics) return null;
    const day = metrics.day || metrics.today || null;
    const week = metrics.week || null;
    const month = metrics.month || null;
    return { day, week, month };
  }, [metrics]);

  return (
    <div className="adm-page">
      <header className="adm-header">
        <div>
          <h1 className="adm-title">Painel Admin</h1>
          <p className="adm-sub">
            Gerencie pedidos em aberto e acompanhe o faturamento.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="adm-btn adm-btn--ghost"
            type="button"
            onClick={() => {
              loadOpenOrders();
              // só atualiza métricas se já desbloqueou, senão só mostra o PIN
              if (metricsUnlocked) loadMetrics();
              else setAskPin(true);
            }}
            disabled={loadingOrders || loadingMetrics}
          >
            {loadingOrders || loadingMetrics ? "Atualizando..." : "Atualizar"}
          </button>

          {!metricsUnlocked && (
            <button
              className="adm-btn adm-btn--primary"
              type="button"
              onClick={() => setAskPin(true)}
            >
              Liberar faturamento
            </button>
          )}
        </div>
      </header>

      {/* PIN */}
      {askPin && !metricsUnlocked && (
        <section className="adm-card">
          <div className="adm-cardTitle">Acesso restrito</div>

          <div
            style={{
              marginTop: "var(--space-sm)",
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <input
              type="password"
              placeholder="Digite o PIN do faturamento"
              value={metricsPin}
              onChange={(e) => setMetricsPin(e.target.value)}
              className="adm-input"
            />

            <button
              className="adm-btn adm-btn--primary"
              type="button"
              onClick={() => loadMetrics({ pinOverride: metricsPin })}
              disabled={!metricsPin || loadingMetrics}
            >
              {loadingMetrics ? "Verificando..." : "Acessar faturamento"}
            </button>

            <button
              className="adm-btn adm-btn--danger"
              type="button"
              onClick={() => {
                setAskPin(false);
                setErrorMetrics("");
              }}
            >
              Cancelar
            </button>
          </div>

          {errorMetrics && (
            <div className="adm-error" style={{ marginTop: "var(--space-md)" }}>
              {errorMetrics}
            </div>
          )}
        </section>
      )}

      {/* MÉTRICAS */}
      <section className="adm-card">
        <div className="adm-cardTitle">Faturamento</div>

        {!metricsUnlocked ? (
          <div className="adm-empty" style={{ marginTop: "var(--space-sm)" }}>
            Bloqueado. Clique em “Liberar faturamento” e informe o PIN.
          </div>
        ) : loadingMetrics ? (
          <div className="adm-loading">Carregando métricas...</div>
        ) : !metricsCards ? (
          <div className="adm-empty">Sem dados de faturamento.</div>
        ) : (
          <div className="adm-metrics">
            <div className="adm-metric">
              <div className="adm-metricLabel">Hoje</div>
              <div className="adm-metricValue">
                {formatBRL(metricsCards.day?.revenue)}
              </div>
              <div className="adm-metricHint">
                {metricsCards.day?.orders ?? 0} pedido(s)
              </div>
            </div>

            <div className="adm-metric">
              <div className="adm-metricLabel">Semana</div>
              <div className="adm-metricValue">
                {formatBRL(metricsCards.week?.revenue)}
              </div>
              <div className="adm-metricHint">
                {metricsCards.week?.orders ?? 0} pedido(s)
              </div>
            </div>

            <div className="adm-metric">
              <div className="adm-metricLabel">Mês</div>
              <div className="adm-metricValue">
                {formatBRL(metricsCards.month?.revenue)}
              </div>
              <div className="adm-metricHint">
                {metricsCards.month?.orders ?? 0} pedido(s)
              </div>
            </div>
          </div>
        )}
      </section>

      {/* PEDIDOS */}
      <section className="adm-card">
        <div className="adm-cardTop">
          <div>
            <div className="adm-cardTitle">Pedidos em aberto</div>
            <div className="adm-cardSub">{openOrders.length} pedido(s)</div>
          </div>
        </div>

        {errorOrders && <div className="adm-error">{errorOrders}</div>}

        {loadingOrders ? (
          <div className="adm-loading">Carregando pedidos...</div>
        ) : openOrders.length === 0 ? (
          <div className="adm-empty">Nenhum pedido em aberto agora.</div>
        ) : (
          <div className="adm-list">
            {openOrders.map((o) => (
              <AdminOrder
                key={o.id}
                order={o}
                busy={busyId === o.id}
                nextStatus={nextStatusMap[o.status] || null}
                onAdvance={() => advanceOrder(o)}
                onCancel={() => cancelOrder(o.id)}
                formatBRL={formatBRL}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
