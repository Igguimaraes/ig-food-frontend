import "./ProductCard.css";

const ProductCard = ({ product, onAdd }) => {
  // Se product não existir, não renderiza (evita crash)
  if (!product) return null;

  const imageUrl = `https://placehold.co/600x400?text=DevsFood+${encodeURIComponent(
    product.name ?? "Produto"
  )}`;

  const price =
    typeof product.price === "number"
      ? product.price.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : "—";

  return (
    <article className="pf-card">
      <img
        className="pf-card__img"
        src={imageUrl}
        alt={product.name ?? "Produto"}
      />

      <div className="pf-card__body">
        <div>
          <h3 className="pf-card__title">{product.name ?? "Sem nome"}</h3>
          <p className="pf-card__sub">Produto #{product.id ?? "—"}</p>
        </div>

        <div className="pf-card__row">
          <div className="pf-card__price">{price}</div>

          <button
            className="pf-btn pf-btn--primary"
            type="button"
            onClick={() => onAdd?.(product)}
            disabled={!onAdd}
          >
            Adicionar
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
