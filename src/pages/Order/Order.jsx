import "./Order.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import OrderProgressBar from "../../components/OrderProgressBar/OrderProgressBar";

const LAST_ORDER_KEY = "devsfood_last_order_id";

export default function Order() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1) Resolve o orderId (state > localStorage)
  const orderId = useMemo(() => {
    const fromState = location.state?.orderId;
    if (fromState != null) return Number(fromState);

    const raw = localStorage.getItem(LAST_ORDER_KEY);
    return raw ? Number(raw) : null;
  }, [location.state]);

  // 2) Estado principal
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);

  // evita setState após unmount
  const aliveRef = useRef(true);

  const isFinalStatus = (status) =>
    status === "ENTREGUE" || status === "CANCELADO";

  const formatBRL = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "R$ 0,00";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const lastUpdateText = useMemo(() => {
    if (!lastUpdate) return "-";
    const hh = String(lastUpdate.getHours()).padStart(2, "0");
    const mm = String(lastUpdate.getMinutes()).padStart(2, "0");
    const ss = String(lastUpdate.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }, [lastUpdate]);

  // 3) Persistir último pedido para sobreviver a refresh
  useEffect(() => {
    if (orderId) {
      localStorage.setItem(LAST_ORDER_KEY, String(orderId));
    }
  }, [orderId]);

  // 4) Buscar pedido
  const fetchOrder = async ({ silent = false } = {}) => {
    setError("");

    if (!orderId) {
      setOrder(null);
      setLastUpdate(null);
      setError(
        "Nenhum pedido encontrado. Volte para a loja e finalize um pedido."
      );
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setOrder(null);
      setLastUpdate(null);
      setError("Você precisa estar logado para acompanhar o pedido.");
      navigate("/login");
      return;
    }

    try {
      if (!silent) setLoading(true);

      // Interceptor já injeta Authorization, então só chama
      const { data } = await api.get(`/orders/${orderId}`);

      if (!aliveRef.current) return;

      setOrder(data);
      setLastUpdate(new Date());
    } catch (err) {
      if (!aliveRef.current) return;

      const status = err?.response?.status;

      if (status === 401) {
        setOrder(null);
        setLastUpdate(null);
        setError("Sessão expirada ou token inválido. Faça login novamente.");
        navigate("/login");
        return;
      }

      if (status === 404) {
        setOrder(null);
        setLastUpdate(null);
        setError("Pedido não encontrado.");
        return;
      }

      setError(err?.response?.data?.message || "Erro ao buscar pedido.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 5) Primeira carga
  useEffect(() => {
    aliveRef.current = true;
    fetchOrder();

    return () => {
      aliveRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // 6) Polling: só se existe order e não finalizou
  useEffect(() => {
    if (!orderId) return;
    if (!order) return;
    if (isFinalStatus(order.status)) return;

    const interval = setInterval(() => {
      fetchOrder({ silent: true });
    }, 6000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, order?.status]);

  return (
    <div className="order-page">
      <div className="order-header">
        <h1 className="order-title">
          {order ? `Pedido: #${order.id}` : "Pedido"}
        </h1>

        <button
          className="order-refresh"
          type="button"
          onClick={() => fetchOrder()}
          disabled={loading}
        >
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {error && <div className="order-error">{error}</div>}

      {!error && !order && (
        <div className="order-card">
          <div className="order-empty">
            Nenhum pedido carregado.
            <button
              className="order-link"
              type="button"
              onClick={() => navigate("/")}
            >
              Voltar para loja
            </button>
          </div>
        </div>
      )}

      {order && (
        <>
          <div className="order-card">
            <OrderProgressBar status={order.status} />

            <div className="order-meta">
              <span className="order-metaLabel">Última atualização</span>
              <span className="order-metaValue">{lastUpdateText}</span>
            </div>
          </div>

          <div className="order-card">
            <h2 className="order-sectionTitle">Itens</h2>

            <div className="order-items">
              {(order.items || []).map((it) => (
                <div className="order-item" key={it.id}>
                  <div className="order-itemLeft">
                    <strong className="order-itemName">
                      {it.product?.name || "Produto"}
                    </strong>
                    <span className="order-itemInfo">
                      {it.quantity}x • {formatBRL(it.price)}
                    </span>
                  </div>

                  <div className="order-itemRight">
                    <strong className="order-itemPrice">
                      {formatBRL(it.price * it.quantity)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-card">
            <h2 className="order-sectionTitle">Total</h2>
            <div className="order-total">
              <strong>{formatBRL(order.total)}</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
