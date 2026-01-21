import "./AdminOrderDetailsModal.css";

export default function AdminOrderDetailsModal({
  open,
  order,
  onClose,
  formatBRL,
}) {
  if (!open) return null;

  const items = order?.items || [];

  const createdAt = order?.createdAt
    ? new Date(order.createdAt).toLocaleString("pt-BR")
    : "—";

  return (
    <div className="adom-backdrop" onClick={onClose} role="presentation">
      <div
        className="adom-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Detalhes do pedido"
      >
        <header className="adom-top">
          <div>
            <div className="adom-title">Pedido #{order?.id}</div>
            <div className="adom-sub">
              <span className={`adom-badge adom-badge--${order?.status}`}>
                {order?.status}
              </span>
              <span className="adom-muted">{createdAt}</span>
            </div>
          </div>

          <button className="adom-close" type="button" onClick={onClose}>
            Fechar
          </button>
        </header>

        <section className="adom-grid">
          <div className="adom-card">
            <div className="adom-cardTitle">Cliente</div>
            <div className="adom-row">
              <span className="adom-muted">Nome</span>
              <strong className="adom-strong">
                {order?.user?.name || "—"}
              </strong>
            </div>
            <div className="adom-row">
              <span className="adom-muted">Email</span>
              <strong className="adom-strong">
                {order?.user?.email || "—"}
              </strong>
            </div>
          </div>

          <div className="adom-card">
            <div className="adom-cardTitle">Resumo</div>
            <div className="adom-row">
              <span className="adom-muted">Total</span>
              <strong className="adom-strong">
                {formatBRL?.(order?.total) ?? "—"}
              </strong>
            </div>
            <div className="adom-row">
              <span className="adom-muted">Itens</span>
              <strong className="adom-strong">{items.length}</strong>
            </div>
          </div>
        </section>

        <section className="adom-items">
          <div className="adom-cardTitle">Itens do pedido</div>

          {items.length === 0 ? (
            <div className="adom-empty">Sem itens.</div>
          ) : (
            <div className="adom-itemsList">
              {items.map((it) => (
                <div className="adom-item" key={it.id}>
                  <div className="adom-itemLeft">
                    <div className="adom-itemName">
                      {it.quantity}x {it.product?.name || "Produto"}
                    </div>
                    <div className="adom-muted">
                      Unitário: {formatBRL?.(it.price) ?? "—"}
                    </div>
                  </div>

                  <div className="adom-itemRight">
                    <strong className="adom-strong">
                      {formatBRL?.(it.price * it.quantity) ?? "—"}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
