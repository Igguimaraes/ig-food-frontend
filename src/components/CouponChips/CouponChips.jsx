import "./CouponChips.css";

export default function CouponChips({ items = [], onPick }) {
  if (!items || items.length === 0) {
    return <div className="cc__empty">Nenhum cupom ativo.</div>;
  }

  return (
    <div className="cc">
      {items.map((c) => (
        <button
          key={c.code}
          className="cc__chip"
          type="button"
          onClick={() => onPick?.(c.code)}
        >
          <span className="cc__code">{c.code}</span>
          <span className="cc__label">{c.label}</span>
        </button>
      ))}
    </div>
  );
}
