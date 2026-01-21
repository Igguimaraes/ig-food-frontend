import "./AdminHistory.css";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { session } from "../../utils/session";
import { useNavigate } from "react-router-dom";
import AdminOrderDetailsModal from "../../components/Admin/AdminOrderDetailsModal";

const STATUS_OPTIONS = [
  "",
  "RECEBIDO",
  "PREPARANDO",
  "PRONTO",
  "ENTREGUE",
  "CANCELADO",
];

const SORT_OPTIONS = [
  { value: "recent", label: "Mais recentes" },
  { value: "old", label: "Mais antigos" },
  { value: "total_desc", label: "Maior valor" },
  { value: "total_asc", label: "Menor valor" },
];

export default function AdminHistory() {
  const navigate = useNavigate();

  // filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [range, setRange] = useState("day");
  const [mode, setMode] = useState("all");
  const [sort, setSort] = useState("recent");

  // paginação
  const [page, setPage] = useState(1);
  const limit = 10;

  // dados
  const [data, setData] = useState(null); // { items, total, page, limit }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // modal detalhe
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);

  const formatBRL = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "R$ 0,00";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const ensureAdmin = () => {
    const token = session.getToken?.() || localStorage.getItem("token");
    const user = session.getUser?.();

    if (!token) {
      navigate("/login", { replace: true, state: { from: "/admin/history" } });
      return false;
    }
    if (user?.role !== "ADMIN") {
      setError("Acesso restrito: apenas administradores.");
      return false;
    }
    return true;
  };

  const fetchHistory = async ({ silent = false } = {}) => {
    if (!ensureAdmin()) return;

    if (!silent) setLoading(true);
    setError("");

    try {
      const params = { page, limit, range, mode };
      if (status) params.status = status;
      if (q.trim()) params.q = q.trim();

      const res = await api.get("/admin/orders", { params });
      const payload = res.data;

      if (Array.isArray(payload)) {
        setData({
          items: payload,
          page: 1,
          limit: payload.length,
          total: payload.length,
        });
      } else {
        setData(payload);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Erro ao carregar histórico.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // mantém filtros funcionando como antes
  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, range, status, mode]);

  const totalPages = useMemo(() => {
    const total = Number(data?.total || 0);
    return Math.max(1, Math.ceil(total / limit));
  }, [data?.total]);

  // sort client-side (sem quebrar backend antigo)
  const viewItems = useMemo(() => {
    const items = Array.isArray(data?.items) ? [...data.items] : [];

    if (sort === "recent")
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "old")
      items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === "total_desc")
      items.sort((a, b) => Number(b.total) - Number(a.total));
    if (sort === "total_asc")
      items.sort((a, b) => Number(a.total) - Number(b.total));

    return items;
  }, [data?.items, sort]);

  const summary = useMemo(() => {
    const items = viewItems;
    const delivered = items.filter((o) => o.status === "ENTREGUE");
    const nonCanceled = items.filter((o) => o.status !== "CANCELADO");

    return {
      orders: items.length,
      sold: nonCanceled.reduce((s, o) => s + Number(o.total || 0), 0),
      realized: delivered.reduce((s, o) => s + Number(o.total || 0), 0),
    };
  }, [viewItems]);

  const applyFilters = () => {
    setPage(1);
    fetchHistory();
  };

  const openDetails = (order) => {
    setDetailOrder(order);
    setDetailOpen(true);
  };

  const closeDetails = () => {
    setDetailOpen(false);
    setDetailOrder(null);
  };

  return (
    <div className="adh-page">
      <header className="adh-header">
        <div>
          <h1 className="adh-title">Histórico de pedidos</h1>
          <p className="adh-sub">
            Consulte por período, status, modo, busca e ordenação.
          </p>
        </div>

        <div className="adh-actionsTop">
          <button
            className="adh-btn adh-btn--ghost"
            type="button"
            onClick={() => navigate("/admin")}
          >
            Voltar ao painel
          </button>

          <button
            className="adh-btn adh-btn--ghost"
            type="button"
            onClick={() => fetchHistory()}
            disabled={loading}
          >
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </header>

      {/* FILTROS */}
      <section className="adh-card">
        <div className="adh-filters">
          <label className="adh-field">
            <span className="adh-label">Buscar</span>
            <input
              className="adh-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pedido #11, Igor, igor@email.com"
            />
          </label>

          <label className="adh-field">
            <span className="adh-label">Período</span>
            <select
              className="adh-select"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="day">Hoje</option>
              <option value="week">Últimos 7 dias</option>
              <option value="month">Últimos 30 dias</option>
            </select>
          </label>

          <label className="adh-field">
            <span className="adh-label">Modo</span>
            <select
              className="adh-select"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="open">Em aberto</option>
              <option value="realized">Realizado (ENTREGUE)</option>
            </select>
          </label>

          <label className="adh-field">
            <span className="adh-label">Status</span>
            <select
              className="adh-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s || "Qualquer"}
                </option>
              ))}
            </select>
          </label>

          <label className="adh-field">
            <span className="adh-label">Ordenar</span>
            <select
              className="adh-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <button
            className="adh-btn adh-btn--primary"
            type="button"
            onClick={applyFilters}
            disabled={loading}
          >
            Filtrar
          </button>
        </div>

        {error && <div className="adh-error">{error}</div>}
      </section>

      {/* LISTA */}
      <section className="adh-card">
        <div className="adh-cardTop">
          <div>
            <div className="adh-cardTitle">Resultados</div>
            <div className="adh-cardSub">
              {data?.total ?? 0} pedido(s) • Página {page} de {totalPages}
            </div>
          </div>

          <div className="adh-pagination">
            <button
              className="adh-btn adh-btn--ghost"
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={loading || page <= 1}
            >
              Anterior
            </button>

            <button
              className="adh-btn adh-btn--ghost"
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={loading || page >= totalPages}
            >
              Próxima
            </button>
          </div>
        </div>

        {loading ? (
          <div className="adh-loading">Carregando histórico...</div>
        ) : !viewItems.length ? (
          <div className="adh-empty">Nenhum pedido encontrado.</div>
        ) : (
          <div className="adh-list">
            {viewItems.map((o) => (
              <div className="adh-row" key={o.id}>
                <div className="adh-left">
                  <div className="adh-id">Pedido #{o.id}</div>

                  <div className="adh-meta">
                    <span className={`adh-badge adh-badge--${o.status}`}>
                      {o.status}
                    </span>
                    <span className="adh-muted">
                      Total: {formatBRL(o.total)}
                    </span>
                    <span className="adh-muted">
                      Cliente: {o.user?.name || "—"}
                    </span>
                    <span className="adh-muted">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleString("pt-BR")
                        : ""}
                    </span>
                  </div>

                  <div className="adh-items">
                    {(o.items || []).slice(0, 3).map((it) => (
                      <div className="adh-item" key={it.id}>
                        <span className="adh-itemName">
                          {it.quantity}x {it.product?.name || "Produto"}
                        </span>
                        <span className="adh-muted">
                          {formatBRL(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}

                    {(o.items || []).length > 3 && (
                      <div className="adh-muted">
                        + {(o.items || []).length - 3} item(ns)
                      </div>
                    )}
                  </div>
                </div>

                <div className="adh-right">
                  <button
                    className="adh-btn adh-btn--primary"
                    type="button"
                    onClick={() => openDetails(o)}
                  >
                    Ver detalhes
                  </button>

                  <button
                    className="adh-btn adh-btn--ghost"
                    type="button"
                    onClick={() =>
                      navigate("/order", { state: { orderId: o.id } })
                    }
                  >
                    Abrir /order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <AdminOrderDetailsModal
        open={detailOpen}
        order={detailOrder}
        onClose={closeDetails}
        formatBRL={formatBRL}
      />
    </div>
  );
}
