// src/pages/Admin/AdminOpenOrders.jsx
import "./AdminOrders.css";
import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";
import AdminOrder from "../../components/AdminOrder/AdminOrder";

const POLL_MS = 6000;

const nextStatusMap = {
  RECEBIDO: "PREPARANDO",
  PREPARANDO: "PRONTO",
  PRONTO: "ENTREGUE",
};

export default function AdminOpenOrders() {
  const aliveRef = useRef(true);

  const [openOrders, setOpenOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState("");

  const [busyId, setBusyId] = useState(null);

  const formatBRL = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "R$ 0,00";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const loadOpenOrders = async ({ silent = false } = {}) => {
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

  useEffect(() => {
    aliveRef.current = true;
    loadOpenOrders();

    return () => {
      aliveRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    } catch (err) {
      setErrorOrders(
        err?.response?.data?.message || "Erro ao cancelar pedido."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="adm-card">
      <div className="adm-cardTop">
        <div>
          <div className="adm-cardTitle">Pedidos em aberto</div>
          <div className="adm-cardSub">{openOrders.length} pedido(s)</div>
        </div>

        <button
          className="adm-btn adm-btn--ghost"
          type="button"
          onClick={() => loadOpenOrders()}
          disabled={loadingOrders}
        >
          {loadingOrders ? "Atualizando..." : "Atualizar"}
        </button>
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
  );
}
