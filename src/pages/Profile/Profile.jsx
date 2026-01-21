import "./Profile.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { session } from "../../utils/session";

const LAST_ORDER_KEY = "devsfood_last_order_id";

function toDateInputValue(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  // yyyy-mm-dd
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function calcAge(dateLike) {
  if (!dateLike) return null;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age >= 0 ? age : null;
}

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => session.getUser());
  const [orders, setOrders] = useState([]);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

  // edição
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formBirthDate, setFormBirthDate] = useState("");

  const token = useMemo(() => session.getToken(), []);

  const formatBRL = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "R$ 0,00";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const logout = () => {
    session.clear();
    navigate("/login");
  };

  const loadUser = async () => {
    setError("");

    const tk = session.getToken();
    if (!tk) {
      setLoadingUser(false);
      setUser(null);
      setError("Você precisa estar logado para acessar o perfil.");
      return;
    }

    try {
      setLoadingUser(true);

      const { data } = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${tk}` },
      });

      setUser(data || null);

      // sync form (fora de edição)
      setFormName(data?.name || "");
      setFormPhone(data?.phone || "");
      setFormBirthDate(toDateInputValue(data?.birthDate));

      // atualiza session/localStorage com dados mais completos
      session.setAuth(tk, data);
    } catch (err) {
      setError(err?.response?.data?.message || "Erro ao carregar usuário.");
      setUser(session.getUser()); // fallback
    } finally {
      setLoadingUser(false);
    }
  };

  const loadOrders = async () => {
    setError("");

    const tk = session.getToken();
    if (!tk) {
      setLoadingOrders(false);
      setOrders([]);
      setError("Você precisa estar logado para ver seus pedidos.");
      return;
    }

    try {
      setLoadingOrders(true);
      const { data } = await api.get("/orders", {
        headers: { Authorization: `Bearer ${tk}` },
      });
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrders([]);
      setError(err?.response?.data?.message || "Erro ao carregar pedidos.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openOrder = (id) => {
    localStorage.setItem(LAST_ORDER_KEY, String(id));
    navigate("/order", { state: { orderId: id } });
  };

  const startEdit = () => {
    if (!user) return;
    setEditing(true);
    setFormName(user.name || "");
    setFormPhone(user.phone || "");
    setFormBirthDate(toDateInputValue(user.birthDate));
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaving(false);
    // restaura valores do user atual
    setFormName(user?.name || "");
    setFormPhone(user?.phone || "");
    setFormBirthDate(toDateInputValue(user?.birthDate));
  };

  const saveProfile = async () => {
    setError("");

    const tk = session.getToken();
    if (!tk) {
      setError("Sessão expirada. Faça login novamente.");
      return;
    }

    if (!formName.trim()) {
      setError("O nome não pode ficar vazio.");
      return;
    }

    if (saving) return;

    try {
      setSaving(true);

      const payload = {
        name: formName.trim(),
        phone: formPhone?.trim() || null,
        birthDate: formBirthDate || null, // YYYY-MM-DD
      };

      const { data } = await api.patch("/users/me", payload, {
        headers: { Authorization: `Bearer ${tk}` },
      });

      setUser(data);
      setEditing(false);

      // atualiza localStorage/session (mantém o token)
      session.setAuth(tk, data);
    } catch (err) {
      setError(err?.response?.data?.message || "Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const age = calcAge(user?.birthDate);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1 className="profile-title">Meu Perfil</h1>
          <p className="profile-subtitle">Seus dados e histórico de pedidos.</p>
        </div>

        <div className="profile-headerActions">
          <button className="profile-logout" onClick={logout} type="button">
            Sair
          </button>
        </div>
      </div>

      {error && <div className="profile-error">{error}</div>}

      <div className="profile-grid">
        {/* Card do usuário */}
        <section className="profile-card">
          <div className="profile-cardTop">
            <h2 className="profile-cardTitle">Dados</h2>

            {!loadingUser &&
              user &&
              (!editing ? (
                <button
                  type="button"
                  className="profile-actionBtn"
                  onClick={startEdit}
                >
                  Editar
                </button>
              ) : (
                <div className="profile-actionGroup">
                  <button
                    type="button"
                    className="profile-actionBtn profile-actionBtn--primary"
                    onClick={saveProfile}
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    type="button"
                    className="profile-actionBtn"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                </div>
              ))}
          </div>

          {loadingUser ? (
            <div className="profile-loading">Carregando usuário...</div>
          ) : !user ? (
            <div className="profile-empty">
              Usuário não carregado. Faça login novamente.
            </div>
          ) : !editing ? (
            <div className="profile-data">
              <div className="profile-row">
                <span className="profile-label">Nome</span>
                <strong className="profile-value">{user.name}</strong>
              </div>

              <div className="profile-row">
                <span className="profile-label">Email</span>
                <strong className="profile-value">{user.email}</strong>
              </div>

              <div className="profile-row">
                <span className="profile-label">Telefone</span>
                <strong className="profile-value">{user.phone || "—"}</strong>
              </div>

              <div className="profile-row">
                <span className="profile-label">Nascimento</span>
                <strong className="profile-value">
                  {user.birthDate
                    ? new Date(user.birthDate).toLocaleDateString("pt-BR")
                    : "—"}
                  {age !== null ? ` (${age} anos)` : ""}
                </strong>
              </div>

              <div className="profile-row">
                <span className="profile-label">Permissão</span>
                <strong className="profile-badge">{user.role}</strong>
              </div>
            </div>
          ) : (
            <div className="profile-form">
              <label className="profile-field">
                <span className="profile-label">Nome</span>
                <input
                  className="profile-input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Seu nome"
                  disabled={saving}
                />
              </label>

              <label className="profile-field">
                <span className="profile-label">Telefone</span>
                <input
                  className="profile-input"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="(99) 99999-9999"
                  disabled={saving}
                />
              </label>

              <label className="profile-field">
                <span className="profile-label">Data de nascimento</span>
                <input
                  className="profile-input"
                  type="date"
                  value={formBirthDate}
                  onChange={(e) => setFormBirthDate(e.target.value)}
                  disabled={saving}
                />
              </label>

              <div className="profile-hint">
                Dica: você pode deixar telefone e nascimento em branco.
              </div>
            </div>
          )}
        </section>

        {/* Card de pedidos */}
        <section className="profile-card">
          <h2 className="profile-cardTitle">Meus pedidos</h2>

          {loadingOrders ? (
            <div className="profile-loading">Carregando pedidos...</div>
          ) : orders.length === 0 ? (
            <div className="profile-empty">Você ainda não fez pedidos.</div>
          ) : (
            <div className="profile-orders">
              {orders.map((o) => (
                <div className="profile-orderItem" key={o.id}>
                  <div className="profile-orderLeft">
                    <strong className="profile-orderId">Pedido #{o.id}</strong>

                    <span className="profile-orderMeta">
                      {o.status} • {formatBRL(o.total)} •{" "}
                      {new Date(o.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>

                  <button
                    className="profile-orderBtn"
                    type="button"
                    onClick={() => openOrder(o.id)}
                  >
                    Acompanhar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
