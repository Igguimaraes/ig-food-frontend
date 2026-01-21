import "./Home.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { session } from "../../utils/session";
import PromoSlider from "../../components/PromoSlider/PromoSlider";

export default function Home() {
  const navigate = useNavigate();

  const user = session.getUser?.() || null;
  const token = session.getToken?.() || null;

  const logged = session.isLogged?.() ? session.isLogged() : Boolean(token);
  const isAdmin = Boolean(logged && user?.role === "ADMIN");

  const [adminOpen, setAdminOpen] = useState(false);
  const adminRef = useRef(null);

  const promos = useMemo(
    () => [
      {
        tag: "Promo do dia",
        title: "Combo DevsBurger",
        description: "Hambúrguer + fritas + refri com preço especial.",
        ctaText: "Entrar na loja",
        search: "hambúrguer",
        image:
          "https://scontent.fuba3-1.fna.fbcdn.net/v/t1.6435-9/45633480_786532078365479_594331136264503296_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_ohc=2G-SLB7BEW0Q7kNvwHBkQuC&_nc_oc=AdlIlmPJj4sZhZE4n4UODVGYAnGAMTvkEooV00d1ojO_dDqpDYQdWYL5ZZ1urLy_qiY&_nc_zt=23&_nc_ht=scontent.fuba3-1.fna&_nc_gid=AOG064RzyfMQksxeyEzpLw&oh=00_AfrdaI8AhFtwiGSNGBy7CpUqCdbk6CMQXeKs20e231KMsw&oe=699251DA",
      },
      {
        tag: "Semana do Delivery",
        title: "Cupons ativos",
        description: "Aplique cupom no carrinho e economize no total.",
        ctaText: "Ver cupons na loja",
        search: "",
        image: "https://placehold.co/1200x600?text=Cupons+da+Semana",
      },
      {
        tag: "Novidade",
        title: "Artesanais premium",
        description: "Novos produtos no cardápio — confira agora.",
        ctaText: "Ver lançamentos",
        search: "artesanal",
        image: "https://placehold.co/1200x600?text=Novidades",
      },
    ],
    []
  );

  const goStore = () => navigate("/store");
  const goLogin = () => navigate("/login");
  const goRegister = () => navigate("/login?mode=register");

  // Fecha popover ao clicar fora / ESC
  useEffect(() => {
    const onDown = (e) => {
      if (!adminOpen) return;
      if (adminRef.current && !adminRef.current.contains(e.target)) {
        setAdminOpen(false);
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") setAdminOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [adminOpen]);

  return (
    <div className="home">
      <div className="home__card">
        {/* Acesso Admin discreto (somente ADMIN) */}
        {isAdmin && (
          <div className="home__admin" ref={adminRef}>
            <button
              className="home__adminBadge"
              type="button"
              onClick={() => setAdminOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={adminOpen}
              title="Acesso administrativo"
            >
              Admin
              <span className="home__adminDot" />
            </button>

            {adminOpen && (
              <div className="home__adminMenu" role="menu">
                <button
                  className="home__adminItem"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAdminOpen(false);
                    navigate("/admin");
                  }}
                >
                  Painel Admin
                  <span className="home__adminHint">/admin</span>
                </button>

                <button
                  className="home__adminItem"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAdminOpen(false);
                    navigate("/admin/history");
                  }}
                >
                  Histórico do dia
                  <span className="home__adminHint">/admin/history</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="home__top">
          <div>
            <h1 className="home__title">DevsFood</h1>
            <p className="home__subtitle">
              Sua loja inteligente: escolha, finalize e acompanhe seu pedido em
              tempo real.
            </p>
          </div>

          {!logged && (
            <div className="home__auth">
              <button className="home__btn home__btn--ghost" onClick={goLogin}>
                Entrar
              </button>
              <button
                className="home__btn home__btn--primary"
                onClick={goRegister}
              >
                Criar conta
              </button>
            </div>
          )}
        </div>

        <div className="home__slider">
          <PromoSlider
            items={promos}
            onSelect={(promo) => {
              navigate("/store", { state: { search: promo?.search || "" } });
            }}
          />
        </div>

        <div className="home__actions">
          <button className="home__btn home__btn--primary" onClick={goStore}>
            Entrar na Loja
          </button>

          <button
            className="home__btn home__btn--ghost"
            onClick={() => navigate("/about")}
          >
            Sobre
          </button>
        </div>
      </div>
    </div>
  );
}
