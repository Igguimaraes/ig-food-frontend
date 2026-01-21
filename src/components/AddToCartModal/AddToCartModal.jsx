import "./AddToCartModal.css";
const AddToCartModal = ({
  open,
  product,
  quantity,
  onMinus,
  onPlus,
  onClose,
  onConfirm,
}) => {
  if (!open || !product) return null;

  const imageUrl = `https://placehold.co/600x400?text=DevsFood+${encodeURIComponent(
    product.name
  )}`;

  const price = product.price?.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="acm-overlay" onClick={onClose}>
      <div className="acm" onClick={(e) => e.stopPropagation()}>
        <div className="acm__header">
          <div>
            <div className="acm__title">Adicionar ao carrinho</div>
            <div className="acm__sub">Escolha a quantidade</div>
          </div>
          <button className="acm__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="acm__body">
          <div className="acm__product">
            <img className="acm__img" src={imageUrl} alt={product.name} />
            <div>
              <div className="acm__name">{product.name}</div>
              <div className="acm__price">{price}</div>
            </div>
          </div>

          <div className="acm__stepper">
            <button className="acm__stepbtn" onClick={onMinus}>
              −
            </button>
            <div className="acm__qty">{quantity}</div>
            <button className="acm__stepbtn" onClick={onPlus}>
              +
            </button>
          </div>
        </div>

        <div className="acm__footer">
          <button className="acm__btn acm__btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="acm__btn acm__btn--primary" onClick={onConfirm}>
            Ok, adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
