import "./OrderDetailsModal.css";
import { useEffect } from "react";

export default function OrderDetailsModal({
  open,
  order,
  onClose,
  formatBRL,
  onOpenOrderPage,
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const items = order?.items || [];
  const createdAt = order?.createdAt
    ? new Date(order.createdAt).toLocaleString("pt-BR")
    : "-";

  return (
    <div className="odm-backdrop" role="dialog" aria-modal="true">
      <div className="odm-modal">
        <div className="odm-top">
          <div>
            <div className="odm-title">Pedido #{order?.id}</div>
            <div className="odm-sub">
              <span className={`odm-badge odm-badge--${order?.status || ""}`}>
                {order?.status || "—"}
              </span>
              <span className="odm-muted">{createdAt}</span>
            </div>
          </div>

          <button className="odm-close" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="odm-grid">
          <section className="odm-card">
            <div className="odm-cardTitle">Cliente</div>

            <div className="odm-kv">
              <span className="odm-k">Nome</span>
              <span className="odm-v">{order?.user?.name || "—"}</span>
            </div>

            <div className="odm-kv">
              <span className="odm-k">Email</span>
              <span className="odm-v">{order?.user?.email || "—"}</span>
            </div>

            <div className="odm-kv">
              <span className="odm-k">Total</span>
              <span className="odm-v odm-strong">
                {formatBRL(order?.total)}
              </span>
            </div>
          </section>

          <section className="odm-card">
            <div className="odm-cardTitle">Itens</div>

            {items.length === 0 ? (
              <div className="odm-empty">Sem itens.</div>
            ) : (
              <div className="odm-items">
                {items.map((it) => (
                  <div className="odm-item" key={it.id}>
                    <div>
                      <div className="odm-itemName">
                        {it.quantity}x {it.product?.name || "Produto"}
                      </div>
                      <div className="odm-muted">
                        Unit: {formatBRL(it.price)}
                      </div>
                    </div>

                    <div className="odm-itemTotal">
                      {formatBRL(Number(it.price) * Number(it.quantity))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="odm-actions">
          <button
            className="odm-btn odm-btn--ghost"
            type="button"
            onClick={onClose}
          >
            Voltar
          </button>

          <button
            className="odm-btn odm-btn--primary"
            type="button"
            onClick={() => onOpenOrderPage?.(order?.id)}
            disabled={!order?.id}
          >
            Abrir na página /order
          </button>
        </div>
      </div>

      <button
        className="odm-overlayClose"
        onClick={onClose}
        aria-label="Fechar"
      />
    </div>
  );
}
