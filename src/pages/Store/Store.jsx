import "./store.css";
import { api } from "../../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import CartDrawer from "../../components/CartDrawer/CartDrawer";
import FilterBar from "../../components/FilterBar/FilterBar";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard/ProductCard";
import AddToCartModal from "../../components/AddToCartModal/AddToCartModal";
import StoreHero from "../../components/StoreHero/StoreHero";
import {
  getCoupon,
  calcDiscount,
  clampDiscount,
  normalizeCoupon,
  COUPONS,
} from "../../utils/coupons";
import CartFab from "../../components/CartFab/CartFab";
import { session } from "../../utils/session";
import MenuItem from "../../components/MenuItem/MenuItem";

const COUPON_KEY = "devsfood_coupon_v1";
const CART_KEY = "devsfood_cart_v1";
const LAST_ORDER_KEY = "devsfood_last_order_id";
const Store = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const [couponCode, setCouponCode] = useState(() => {
    try {
      return localStorage.getItem(COUPON_KEY) || "";
    } catch {
      return "";
    }
  });

  const [couponError, setCouponError] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name_asc");

  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [cartOpen, setCartOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectProduct, setSelectProduct] = useState(null);
  const [selectQty, setSelectQty] = useState(1);

  const [creatingOrder, setCreatingOrder] = useState(false);

  const [coupon, setCoupon] = useState("");

  const promos = [
    {
      id: "p1",
      tag: "Novidade",
      title: "Monte seu pedido em 1 minuto",
      description:
        "Cards rápidos, carrinho inteligente e acompanhamento ao vivo.",
      pill: "Mais rápido",
    },
    {
      id: "p2",
      tag: "Cupom",
      title: "Descontos limitados",
      description: "Use um cupom e veja o total atualizado em tempo real.",
      pill: "Economize",
    },
    {
      id: "p3",
      tag: "Status",
      title: "Pedido em tempo real",
      description: "Recebido → Preparando → Pronto → Entregue.",
      pill: "Live",
    },
  ];

  const couponList = useMemo(() => {
    // transforma o objeto COUPONS em array
    return Object.entries(COUPONS).map(([code, c]) => ({
      code,
      label: c.label,
    }));
  }, []);

  const pickCouponFromHero = (code) => {
    const normalized = normalizeCoupon(code);
    setCouponError("");

    // só aplica se for válido
    if (!getCoupon(normalized)) {
      setCouponError("Cupom inválido.");
      return;
    }

    setCouponCode(normalized);
    // opcional: abrir carrinho para o usuário ver o desconto
    setCartOpen(true);
  };

  const logged = session.isLogged();
  const user = session.getUser();

  const goLogin = () => navigate("/login");
  const goSignup = () => navigate("/login"); // por enquanto manda para login (depois criamos cadastro)
  const goRegister = () => navigate("/login?mode=register");

  const applyCoupon = () => {
    setCouponError("");
    const normalized = normalizeCoupon(couponCode);

    if (!normalized) {
      setCouponError("Digite um cupom.");
      return;
    }

    const c = getCoupon(normalized);
    if (!c) {
      setCouponError("Cupom inválido.");
      return;
    }

    // garante que fica normalizado
    setCouponCode(normalized);
  };

  const clearCoupon = () => {
    setCouponError("");
    setCouponCode("");
    try {
      localStorage.removeItem(COUPON_KEY);
    } catch {}
  };

  const loadProducts = async () => {
    setError("");
    setLoadingProducts(true);

    try {
      const { data } = await api.get("/products");
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Erro ao carregar produtos");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(COUPON_KEY, couponCode);
    } catch {}
  }, [couponCode]);

  // Persistência do carrinho
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    loadProducts();
  }, []);
  useEffect(() => {
    const incomingSearch = location.state?.search;
    if (typeof incomingSearch === "string") {
      setSearch(incomingSearch);
      // limpa o state para não reaplicar se o usuário voltar/avançar
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = useMemo(() => {
    const s = search.trim().toLowerCase();
    let list = [...products];

    if (s) list = list.filter((p) => p.name.toLowerCase().includes(s));

    if (sort === "name_asc") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list.sort((a, b) => b.price - a.price);

    return list;
  }, [products, search, sort]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, quantity]) => {
        const product = products.find((p) => p.id === Number(productId));
        if (!product) return null;
        return { product, quantity: Number(quantity) };
      })
      .filter(Boolean);
  }, [cart, products]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, it) => sum + it.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, it) => sum + it.product.price * it.quantity,
      0
    );
  }, [cartItems]);

  const openAdd = (product) => {
    setSelectProduct(product);
    const current = cart[product.id] || 0;
    setSelectQty(current > 0 ? current : 1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectProduct(null);
    setSelectQty(1);
  };

  const modalMinus = () => setSelectQty((q) => Math.max(1, q - 1));
  const modalPlus = () => setSelectQty((q) => q + 1);

  const confirmAdd = () => {
    if (!selectProduct) return;

    setCart((prev) => {
      const next = { ...prev, [selectProduct.id]: selectQty };

      // se estava vazio antes e agora tem item, abre o carrinho
      if (Object.keys(prev).length === 0) {
        setCartOpen(true);
      }

      return next;
    });

    closeModal();
  };

  const inc = (productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const dec = (productId) => {
    setCart((prev) => {
      const next = (prev[productId] || 0) - 1;
      const copy = { ...prev };
      if (next <= 0) delete copy[productId];
      else copy[productId] = next;
      return copy;
    });
  };

  const remove = (productId) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const finishOrder = async () => {
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Você precisa estar logado para finalizar o pedido.");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }

    if (creatingOrder) return; // evita clique duplo

    setCreatingOrder(true);

    try {
      const payload = {
        items: cartItems.map((ci) => ({
          productId: ci.product.id,
          quantity: ci.quantity,
        })),
      };

      const { data: createdOrder } = await api.post("/orders", payload);

      // limpa carrinho
      setCart({});
      // limpa cupom
      clearCoupon();
      localStorage.removeItem(CART_KEY);

      // salva último pedido (sobrevive refresh)
      localStorage.setItem(LAST_ORDER_KEY, String(createdOrder.id));

      // vai para progresso
      navigate("/order", { state: { orderId: createdOrder.id } });
    } catch (err) {
      setError(err?.response?.data?.message || "Erro ao finalizar pedido.");
    } finally {
      setCreatingOrder(false);
    }
  };

  useEffect(() => {
    if (cartItems.length === 0) setCartOpen(false);
  }, [cartItems.length]);

  const appliedCoupon = useMemo(() => {
    const c = getCoupon(couponCode);
    return c; // null se inválido
  }, [couponCode]);

  const subtotal = cartTotal;

  const discount = useMemo(() => {
    const raw = calcDiscount(subtotal, appliedCoupon);
    return clampDiscount(raw, subtotal);
  }, [subtotal, appliedCoupon]);

  const totalWithDiscount = useMemo(() => {
    const t = Number(subtotal) - Number(discount);
    return Math.max(0, t);
  }, [subtotal, discount]);

  return (
    <div className="st-page">
      <header className="st-header">
        {/* Por enquanto deixa sem header*/}

        {error && <div className="st-error">{error}</div>}
      </header>
      <StoreHero
        title="DevsFood"
        subtitle="Escolha seus produtos e acompanhe o pedido em tempo real."
        promos={promos}
        coupons={couponList}
        onPickCoupon={pickCouponFromHero}
        logged={logged}
        userName={user?.name}
        onLogin={goLogin}
        onSignup={goSignup}
      />

      <CartFab
        count={cartCount}
        open={cartOpen}
        onToggle={() => setCartOpen((v) => !v)}
        iconSrc="/assets/cart.png" // troque pelo caminho do seu ícone
      />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        onReload={loadProducts}
      />

      <main className={`st-layout ${cartOpen ? "" : "st-layout--wide"}`}>
        <section>
          {loadingProducts ? (
            <div className="st-loading">Carregando produtos...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="st-empty">Nenhum produto encontrado.</div>
          ) : (
            <div className="st-grid">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={openAdd} />
              ))}
            </div>
          )}
        </section>

        <CartDrawer
          open={cartOpen}
          items={cartItems}
          subtotal={subtotal}
          discount={discount}
          total={totalWithDiscount}
          couponCode={couponCode}
          appliedCoupon={appliedCoupon}
          couponError={couponError}
          onCouponChange={setCouponCode}
          onApplyCoupon={applyCoupon}
          onClearCoupon={clearCoupon}
          onInc={inc}
          onDec={dec}
          onRemove={remove}
          onToggle={() => setCartOpen((v) => !v)}
          onFinish={finishOrder}
          finishing={creatingOrder}
        />
      </main>

      <AddToCartModal
        open={modalOpen}
        product={selectProduct}
        quantity={selectQty}
        onMinus={modalMinus}
        onPlus={modalPlus}
        onClose={closeModal}
        onConfirm={confirmAdd}
      />
    </div>
  );
};

export default Store;
