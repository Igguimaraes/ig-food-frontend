import "./CartFab.css";

export default function CartFab({ count = 0, open, onToggle, iconSrc }) {
  return (
    <button className={`cfab ${open ? "cfab--open" : ""}`} onClick={onToggle}>
      <img className="cfab__icon" src={iconSrc} alt="Carrinho" />
      {count > 0 && <span className="cfab__badge">{count}</span>}
    </button>
  );
}
