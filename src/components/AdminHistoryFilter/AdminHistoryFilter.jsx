import "./AdminHistoryFilter.css";

export default function AdminHistoryFilter({
  q,
  onQ,
  status,
  onStatus,
  mode,
  onMode,
  from,
  onFrom,
  to,
  onTo,
  onApply,
  onClear,
}) {
  return (
    <div className="ahf">
      <input
        className="ahf__input"
        placeholder="Buscar por #pedido, nome ou email"
        value={q}
        onChange={(e) => onQ(e.target.value)}
      />

      <select
        className="ahf__select"
        value={mode}
        onChange={(e) => onMode(e.target.value)}
      >
        <option value="all">Todos</option>
        <option value="open">Em aberto</option>
        <option value="realized">Entregues</option>
      </select>

      <select
        className="ahf__select"
        value={status}
        onChange={(e) => onStatus(e.target.value)}
      >
        <option value="">Status (todos)</option>
        <option value="RECEBIDO">RECEBIDO</option>
        <option value="PREPARANDO">PREPARANDO</option>
        <option value="PRONTO">PRONTO</option>
        <option value="ENTREGUE">ENTREGUE</option>
        <option value="CANCELADO">CANCELADO</option>
      </select>

      <div className="ahf__dates">
        <input
          className="ahf__date"
          type="date"
          value={from}
          onChange={(e) => onFrom(e.target.value)}
        />
        <input
          className="ahf__date"
          type="date"
          value={to}
          onChange={(e) => onTo(e.target.value)}
        />
      </div>

      <button
        className="adm-btn adm-btn--primary"
        type="button"
        onClick={onApply}
      >
        Aplicar
      </button>

      <button className="adm-btn" type="button" onClick={onClear}>
        Limpar
      </button>
    </div>
  );
}
