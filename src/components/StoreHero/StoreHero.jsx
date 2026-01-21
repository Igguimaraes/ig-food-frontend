import "./StoreHero.css";
import PromoSlider from "../PromoSlider/PromoSlider";
import CouponChips from "../CouponChips/CouponChips";

export default function StoreHero({
  title = "DevsFood",
  subtitle = "Escolha seus produtos e acompanhe o pedido em tempo real.",
  promos = [],
  coupons = [],
  onPickCoupon,

  // NOVO (não quebra nada se você não passar)
  logged = false,
  userName = "",
  onLogin,
  onSignup,
}) {
  return (
    <section className="hero">
      <div className="hero__top">
        <div className="hero__text">
          <h1 className="hero__title">{title}</h1>
          <p className="hero__subtitle">{subtitle}</p>
        </div>

        {/* NOVO: lado direito do topo */}
        <div className="hero__right">
          <div className="hero__badges">
            <span className="hero__badge hero__badge--primary">Delivery</span>
            <span className="hero__badge">Tempo real</span>
            <span className="hero__badge">Pagamentos</span>
          </div>

          {/* NOVO: ações */}
          {logged ? (
            <div className="hero__welcome">
              <span className="hero__welcomeLabel">Olá,</span>
              <strong className="hero__welcomeName">
                {userName || "usuário"}
              </strong>
            </div>
          ) : (
            <div className="hero__cta">
              <button
                className="hero__btn hero__btn--ghost"
                type="button"
                onClick={onLogin}
                disabled={!onLogin}
              >
                Entrar
              </button>

              <button
                className="hero__btn hero__btn--primary"
                type="button"
                onClick={onSignup}
                disabled={!onSignup}
              >
                Criar conta
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="hero__grid">
        <div className="hero__panel">
          <div className="hero__panelTitle">Promoções</div>
          <PromoSlider items={promos} />
        </div>

        <div className="hero__panel">
          <div className="hero__panelTitle">Cupons disponíveis</div>
          <CouponChips items={coupons} onPick={onPickCoupon} />
          <div className="hero__hint">
            Dica: clique em um cupom para aplicar no carrinho.
          </div>
        </div>
      </div>
    </section>
  );
}
