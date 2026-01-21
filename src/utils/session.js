const TOKEN_KEY = "token";
const USER_KEY = "user";

export const session = {
  // =========================
  // COMPAT: mantém seu login atual funcionando
  // (se seu Login usa session.setAuth(token, user))
  // =========================
  setAuth(token, user) {
    this.setToken(token);
    this.setUser(user);
  },

  // =========================
  // Token
  // =========================
  getToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    return token && token.trim() ? token : null;
  },

  setToken(token) {
    if (!token || typeof token !== "string" || !token.trim()) return;
    localStorage.setItem(TOKEN_KEY, token.trim());
  },

  // =========================
  // User
  // =========================
  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      // validação mínima
      if (!parsed || typeof parsed !== "object") return null;
      if (!parsed.id || !parsed.email) return null;

      return parsed;
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (!user || typeof user !== "object") return;

    // validação mínima para evitar salvar lixo
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    if (!safeUser.id || !safeUser.email) return;

    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
  },

  // =========================
  // Helpers
  // =========================
  isLogged() {
    return Boolean(this.getToken());
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
