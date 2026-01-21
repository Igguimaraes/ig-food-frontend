import "./CartDrawer.css";

const formatBRL = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const CartDrawer = ({
  open,
  items,

  subtotal,
  discount,
  total,

  couponCode,
  appliedCoupon,
  couponError,
  onCouponChange,
  onApplyCoupon,
  onClearCoupon,

  onInc,
  onDec,
  onRemove,
  onToggle,
  onFinish,
  finishing,
}) => {
  return (
    <aside className={`cd ${open ? "cd--open" : "cd--closed"}`}>
      <div className="cd__header">
        <div>
          <div className="cd__title">Carrinho</div>
          <div className="cd__sub">{items.length} item(s)</div>
        </div>

        <button className="cd__toggle" onClick={onToggle} type="button">
          {open ? "Ocultar" : "Mostrar"}
        </button>
      </div>

      {open && (
        <div className="cd__body">
          {items.length === 0 ? (
            <div className="cd__empty">
              Adicione itens para criar um pedido.
            </div>
          ) : (
            <>
              <div className="cd__list">
                {items.map((ci) => (
                  <div className="cd__item" key={ci.product.id}>
                    <div className="cd__itemTop">
                      <div>
                        <div className="cd__name">{ci.product.name}</div>
                        <div className="cd__price">
                          {formatBRL(ci.product.price)}
                        </div>
                      </div>

                      <button
                        className="cd__remove"
                        onClick={() => onRemove(ci.product.id)}
                        type="button"
                      >
                        Remover
                      </button>
                    </div>

                    <div className="cd__actions">
                      <button
                        className="cd__step"
                        onClick={() => onDec(ci.product.id)}
                        type="button"
                      >
                        −
                      </button>

                      <div className="cd__qty">{ci.quantity}</div>

                      <button
                        className="cd__step"
                        onClick={() => onInc(ci.product.id)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* CUPOM */}
              <div className="cd__coupon">
                <div className="cd__couponRow">
                  <input
                    className="cd__couponInput"
                    value={couponCode}
                    onChange={(e) => onCouponChange?.(e.target.value)}
                    placeholder="Cupom (ex: DEV10)"
                  />

                  {appliedCoupon ? (
                    <button
                      className="cd__couponBtn cd__couponBtn--ghost"
                      type="button"
                      onClick={onClearCoupon}
                    >
                      Remover
                    </button>
                  ) : (
                    <button
                      className="cd__couponBtn"
                      type="button"
                      onClick={onApplyCoupon}
                    >
                      Aplicar
                    </button>
                  )}
                </div>

                {appliedCoupon && (
                  <div className="cd__couponOk">
                    Aplicado: <strong>{appliedCoupon.code}</strong> (
                    {appliedCoupon.label})
                  </div>
                )}

                {couponError && (
                  <div className="cd__couponErr">{couponError}</div>
                )}
              </div>

              {/* RESUMO */}
              <div className="cd__summary">
                <div className="cd__sumRow">
                  <span>Subtotal</span>
                  <strong>{formatBRL(subtotal)}</strong>
                </div>

                <div className="cd__sumRow">
                  <span>Desconto</span>
                  <strong className="cd__discount">
                    - {formatBRL(discount)}
                  </strong>
                </div>

                <div className="cd__sumRow cd__sumRow--total">
                  <span>Total</span>
                  <strong>{formatBRL(total)}</strong>
                </div>
              </div>

              <button
                className="cd__finish"
                onClick={onFinish}
                disabled={finishing || items.length === 0}
                type="button"
              >
                {finishing ? "Finalizando..." : "Finalizar pedido"}
              </button>

              <div className="cd__hint">
                Ao finalizar, você será direcionado para acompanhar seu pedido.
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
};

export default CartDrawer;
