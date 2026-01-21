import "./Login.css";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { session } from "../../utils/session";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const modeFromQuery = useMemo(() => {
    const qs = new URLSearchParams(location.search);
    const mode = qs.get("mode");
    return mode === "register" ? "register" : "login";
  }, [location.search]);

  const [mode, setMode] = useState(modeFromQuery);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState(""); // YYYY-MM-DD
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("igor@email.com");
  const [password, setPassword] = useState("123456");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMode(modeFromQuery);
    setError("");
  }, [modeFromQuery]);

  const goToStore = () => navigate("/", { replace: true });

  const sanitizePhone = (value) => value.replace(/[^\d+]/g, "");

  const isValidBirthDate = (value) => {
    // aceita vazio no login; no cadastro valida
    if (!value) return false;
    // formato básico YYYY-MM-DD
    const ok = /^\d{4}-\d{2}-\d{2}$/.test(value);
    if (!ok) return false;

    const d = new Date(value + "T00:00:00");
    if (Number.isNaN(d.getTime())) return false;

    // regra simples: não pode ser no futuro
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d <= today;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (mode === "register" && !name)) {
      setError("Preencha todos os campos.");
      return;
    }

    if (mode === "register") {
      if (!isValidBirthDate(birthDate)) {
        setError("Informe uma data de nascimento válida.");
        return;
      }
      if (!phone.trim()) {
        setError("Informe um telefone.");
        return;
      }
      // validação leve: pelo menos 10 dígitos (Brasil)
      const digits = sanitizePhone(phone).replace(/\D/g, "");
      if (digits.length < 10) {
        setError("Telefone inválido (mín. 10 dígitos).");
        return;
      }
    }

    if (loading) return;

    try {
      setLoading(true);

      // 1) Cadastro
      if (mode === "register") {
        await api.post("/users", {
          name: name.trim(),
          email: email.trim(),
          password,
          birthDate, // "YYYY-MM-DD"
          phone: sanitizePhone(phone),
        });
      }

      // 2) Login
      const { data } = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      // 3) Persistir sessão
      session.setAuth(data.token, data.user);

      // 4) Redirecionar
      const from = location.state?.from;
      navigate(from || "/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Erro ao autenticar.");
    } finally {
      setLoading(false);
    }
  };

  const setLoginMode = () => {
    navigate("/login", { replace: true });
  };

  const setRegisterMode = () => {
    navigate("/login?mode=register", { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-top">
          <div>
            <h1 className="login-title">DevsFood</h1>
            <p className="login-sub">
              {mode === "login"
                ? "Entre para finalizar pedidos e acompanhar o status."
                : "Crie sua conta para comprar e acompanhar pedidos."}
            </p>
          </div>

          <button className="login-back" type="button" onClick={goToStore}>
            Voltar
          </button>
        </div>

        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${mode === "login" ? "is-active" : ""}`}
            onClick={setLoginMode}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`login-tab ${mode === "register" ? "is-active" : ""}`}
            onClick={setRegisterMode}
          >
            Criar conta
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={onSubmit}>
          {mode === "register" && (
            <>
              <label className="login-field">
                <span className="login-label">Nome</span>
                <input
                  className="login-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </label>

              <div className="login-row">
                <label className="login-field">
                  <span className="login-label">Data de nascimento</span>
                  <input
                    className="login-input"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    type="date"
                  />
                </label>

                <label className="login-field">
                  <span className="login-label">Telefone</span>
                  <input
                    className="login-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(99) 99999-9999"
                    inputMode="tel"
                  />
                </label>
              </div>
            </>
          )}

          <label className="login-field">
            <span className="login-label">Email</span>
            <input
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              type="email"
            />
          </label>

          <label className="login-field">
            <span className="login-label">Senha</span>
            <input
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              type="password"
            />
          </label>

          <button className="login-submit" type="submit" disabled={loading}>
            {loading
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar"
                : "Criar e entrar"}
          </button>

          <div className="login-hint">
            Dica (MVP): senha é salva sem hash no backend por enquanto.
          </div>
        </form>
      </div>
    </div>
  );
}
