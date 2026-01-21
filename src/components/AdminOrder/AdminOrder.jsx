import "./AdminOrder.css";

export default function AdminOrder({
  order,
  busy,
  nextStatus,
  onAdvance,
  onCancel,
  formatBRL,
  showActions = true,
}) {
  if (!order) return null;

  const items = order.items || [];

  return (
    <div className="adm-order">
      <div className="adm-orderLeft">
        <div className="adm-orderId">Pedido #{order.id}</div>

        <div className="adm-orderMeta">
          <span className={`adm-badge adm-badge--${order.status}`}>
            {order.status}
          </span>

          <span className="adm-muted">Total: {formatBRL(order.total)}</span>

          <span className="adm-muted">
            {order.user?.name ? `Cliente: ${order.user.name}` : "Cliente"}
          </span>

          <span className="adm-muted">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString("pt-BR")
              : ""}
          </span>
        </div>

        <div className="adm-items">
          {items.slice(0, 3).map((it) => (
            <div className="adm-item" key={it.id}>
              <span className="adm-itemName">
                {it.quantity}x {it.product?.name || "Produto"}
              </span>
              <span className="adm-muted">
                {formatBRL(it.price * it.quantity)}
              </span>
            </div>
          ))}

          {items.length > 3 && (
            <div className="adm-muted">+ {items.length - 3} item(ns)</div>
          )}
        </div>
      </div>

      {showActions && (
        <div className="adm-orderRight">
          <button
            className="adm-btn adm-btn--primary"
            type="button"
            onClick={onAdvance}
            disabled={!nextStatus || busy}
          >
            {nextStatus ? `Avançar → ${nextStatus}` : "Finalizado"}
          </button>

          <button
            className="adm-btn adm-btn--danger"
            type="button"
            onClick={onCancel}
            disabled={busy}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
