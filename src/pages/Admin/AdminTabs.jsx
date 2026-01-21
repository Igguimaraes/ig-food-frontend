import "./AdminTabs.css";

export default function AdminTabs({ active, onChange }) {
  return (
    <div className="adm-tabs">
      <button
        className={`adm-tab ${active === "orders" ? "is-active" : ""}`}
        onClick={() => onChange("orders")}
      >
        Pedidos
      </button>

      <button
        className={`adm-tab ${active === "metrics" ? "is-active" : ""}`}
        onClick={() => onChange("metrics")}
      >
        Faturamento
      </button>

      <button
        className={`adm-tab ${active === "history" ? "is-active" : ""}`}
        onClick={() => onChange("history")}
      >
        Histórico
      </button>
    </div>
  );
}
