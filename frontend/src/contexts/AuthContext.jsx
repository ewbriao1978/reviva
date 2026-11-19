// =============================================================================
// src/contexts/AuthContext.jsx - Quem esta logado no sistema
// =============================================================================
// Um CONTEXT do React serve para compartilhar uma informacao com varias telas
// ao mesmo tempo, sem precisar repassa-la de componente em componente.
//
// Aqui guardamos o usuario logado e as funcoes de entrar e sair. Qualquer
// pagina consegue acessar isso escrevendo:
//
//     const { usuario, sair } = useAuth();
//
// SOBRE O localStorage:
// O token fica guardado no localStorage do navegador para que o usuario
// continue logado ao recarregar a pagina. E a opcao mais simples e por isso
// foi escolhida neste MVP. A limitacao e que um script malicioso injetado na
// pagina conseguiria ler esse valor (ataque conhecido como XSS). Em um sistema
// em producao, a alternativa mais segura seria guardar o token em um cookie
// httpOnly, que o JavaScript da pagina nao consegue ler.
// =============================================================================

import { createContext, useContext, useState } from "react";
import api from "../services/api.js";

// Cria o "canal" por onde os dados serao compartilhados.
const AuthContext = createContext();

// O Provider envolve a aplicacao inteira (ver App.jsx) e fornece os dados.
export function AuthProvider({ children }) {
  // Tenta recuperar o usuario que ja estava logado antes.
  // A funcao dentro do useState so roda UMA vez, na abertura da pagina.
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    // JSON.parse converte o texto guardado de volta em objeto.
    return salvo ? JSON.parse(salvo) : null;
  });

  // --- Entrar na plataforma ---
  async function entrar(email, senha) {
    // Chama POST /api/auth/login no backend.
    const resposta = await api.post("/auth/login", { email, senha });

    // Guarda o token e os dados no navegador.
    localStorage.setItem("token", resposta.data.token);
    localStorage.setItem("usuario", JSON.stringify(resposta.data.usuario));

    // Atualiza o estado, o que faz as telas se redesenharem.
    setUsuario(resposta.data.usuario);

    return resposta.data.usuario;
  }

  // --- Criar conta ---
  async function cadastrar(nome, email, senha) {
    // O backend ja devolve o token no cadastro, entao o usuario entra direto.
    const resposta = await api.post("/auth/register", { nome, email, senha });

    localStorage.setItem("token", resposta.data.token);
    localStorage.setItem("usuario", JSON.stringify(resposta.data.usuario));
    setUsuario(resposta.data.usuario);

    return resposta.data.usuario;
  }

  // --- Sair ---
  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  // Atualiza os dados do usuario na tela apos editar o perfil.
  function atualizarUsuario(novosDados) {
    localStorage.setItem("usuario", JSON.stringify(novosDados));
    setUsuario(novosDados);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        entrar,
        cadastrar,
        sair,
        atualizarUsuario,
        // Valores calculados, para as telas nao precisarem repetir a conta.
        estaLogado: usuario !== null,
        ehAdmin: usuario !== null && usuario.tipo === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Atalho para as paginas usarem o contexto sem importar duas coisas.
export function useAuth() {
  return useContext(AuthContext);
}
