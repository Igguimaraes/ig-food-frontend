import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

export default function Store({ onOrderCreated }) {
  const [products, setProducts] = useState([]);
  const [qtyById, setQtyById] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cartItems = useMemo(() => {
    return products
      .map((p) => ({
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: Number(qtyById[p.id] || 0),
      }))
      .filter((i) => i.quantity > 0);
  }, [products, qtyById]);

  const total = useMemo(() => {
    return cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [cartItems]);

  async function loadProducts() {
    setError("");
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (err) {
      setError("Erro ao carregar produtos");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleCreateOrder() {
    setError("");
    setLoading(true);

    try {
      const payload = {
        items: cartItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };

      const { data } = await api.post("/orders", payload);

      // limpa carrinho
      setQtyById({});
      onOrderCreated?.(data);
      alert("Pedido criado com sucesso!");
    } catch (err) {
      setError(err?.response?.data?.message || "Erro ao criar pedido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "Arial" }}>
      <h2>Loja</h2>

      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div>R$ {p.price.toFixed(2)}</div>
            </div>

            <input
              type="number"
              min="0"
              value={qtyById[p.id] || ""}
              onChange={(e) =>
                setQtyById((prev) => ({ ...prev, [p.id]: e.target.value }))
              }
              placeholder="0"
              style={{ width: 80, padding: 8 }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <div style={{ fontWeight: 700 }}>Total: R$ {total.toFixed(2)}</div>

        <button
          disabled={loading || cartItems.length === 0}
          onClick={handleCreateOrder}
          style={{ padding: "10px 14px" }}
        >
          {loading ? "Criando..." : "Finalizar pedido"}
        </button>
      </div>
    </div>
  );
}
