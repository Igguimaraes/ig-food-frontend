import "./FilterBar.css";

const FilterBar = ({
  search,
  onSearchChange,
  sort,
  onSortChange,
  onReload,
}) => {
  return (
    <div className="fb">
      <div className="fb__field">
        <span className="fb__label">Buscar</span>
        <input
          className="fb__input"
          placeholder="Filtrar por nome..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="fb__field fb__field--select">
        <span className="fb__label">Ordenar</span>
        <select
          className="fb__select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="name_asc">Nome A-Z</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
        </select>
      </div>

      <button className="fb__btn" type="button" onClick={onReload}>
        Recarregar
      </button>
    </div>
  );
};

export default FilterBar;
