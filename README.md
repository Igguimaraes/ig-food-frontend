# Frontend

Frontend da aplicação **DevsFood**, desenvolvido para consumir a API backend via HTTP, oferecendo uma interface moderna, responsiva e orientada à experiência do usuário.

---

## Sumário

- [Visão geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como rodar o projeto](#como-rodar-o-projeto)
- [Integração com o backend](#integração-com-o-backend)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Boas práticas adotadas](#boas-práticas-adotadas)
- [Troubleshooting](#troubleshooting)
- [Licença](#licença)

---

## Visão geral

O **DevsFood Frontend** é responsável por:

- Exibir produtos e informações da aplicação
- Realizar autenticação de usuários
- Consumir a API backend de forma segura
- Gerenciar estado e interação do usuário

O projeto foi estruturado com foco em **clareza de código**, **componentização** e **facilidade de manutenção**.

---

## Tecnologias

Tecnologias normalmente utilizadas no frontend do projeto:

- **React.js**
- **JavaScript (ES6+)**
- **HTML5**
- **CSS3**
- **Fetch API** para requisições HTTP
- **JWT** (armazenado no navegador)
- (Opcional) **React Router** para navegação
- (Opcional) **Vite** ou **Create React App**

> Ajuste esta lista caso esteja usando Vite, Next.js ou outra stack específica.

---

## Funcionalidades

- Interface para consumo da API DevsFood
- Autenticação de usuários
- Armazenamen

Instale as dependências:

npm install

Variáveis de ambiente

Crie um arquivo .env na raiz do frontend (exemplo para React):

REACT_APP_API_URL=http://localhost:5010

Ou, se estiver usando Vite:

VITE_API_URL=http://localhost:5010

Essas variáveis definem a URL base da API backend.

Como rodar o projeto
Desenvolvimento
npm start

ou, se usar Vite:

npm run dev

A aplicação ficará disponível em:

http://localhost:3000 (CRA)

http://localhost:5173 (Vite)

Build de produção
npm run build

Integração com o backend

O frontend se comunica com o backend via HTTP usando Fetch API.

Exemplo de requisição autenticada:

fetch(`${API_URL}/endpoint`, {
method: "GET",
headers: {
"Authorization": `Bearer ${token}`,
"Content-Type": "application/json"
}
});

Fluxo de autenticação:

Usuário realiza login

Backend retorna token JWT

Token é armazenado (ex.: LocalStorage ou Cookie)

Token é enviado em requisições protegidas

Estrutura do projeto

Exemplo de estrutura recomendada:

frontend/
├─ public/
├─ src/
│ ├─ components/
│ ├─ pages/
│ ├─ services/
│ │ └─ api.js
│ ├─ styles/
│ ├─ App.js
│ └─ main.jsx
├─ .env
├─ package.json
└─ README.md

components: componentes reutilizáveis

pages: telas da aplicação

services: comunicação com a API

styles: estilos globais ou por componente

Boas práticas adotadas

Separação de responsabilidades

Componentização do layout

Reutilização de funções de API

Uso de variáveis de ambiente

Código legível e organizado

Pronto para escalar novas funcionalidades

Troubleshooting
API não responde

Verifique se o backend está rodando

Confirme a URL definida no .env

Verifique CORS no backend

Token inválido ou expirado

Refazer login

Limpar LocalStorage/Cookies

Verificar expiração do JWT

Erro ao rodar npm start

Execute npm install novamente

Apague node_modules e rode:

npm install

Licença

Este projeto é de uso educacional e demonstrativo.
Defina uma licença caso deseje torná-lo open source.


