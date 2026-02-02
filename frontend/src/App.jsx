import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [tarefas, setTarefas] = useState([]);

  // Form
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [editandoTarefaId, setEditandoTarefaId] = useState(null);

  // Feedback
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarTarefas();
  }, []);

  function limparMensagens() {
    setMensagem("");
    setErro("");
  }

  function limparFormulario() {
    setTitulo("");
    setDescricao("");
    setEditandoTarefaId(null);
  }

  function buscarTarefas() {
    setLoading(true);
    limparMensagens();

    fetch("http://127.0.0.1:5153/api/tarefas")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar tarefas");
        return res.json();
      })
      .then((data) => setTarefas(data))
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }

  // POST - criar
  function criarTarefa() {
    limparMensagens();

    return fetch("http://127.0.0.1:5153/api/tarefas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, descricao }),
    }).then((res) => {
      if (!res.ok) throw new Error("Erro ao criar tarefa (verifique o título)");
      return res.json();
    });
  }

  // PUT - editar titulo/descricao
  function salvarEdicao() {
    limparMensagens();

    return fetch(`http://127.0.0.1:5153/api/tarefas/${editandoTarefaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, descricao }),
    }).then((res) => {
      if (!res.ok) throw new Error("Erro ao editar tarefa");
      return res.json();
    });
  }

  // Submit do formulário (criar OU editar)
  function enviarFormulario(e) {
    e.preventDefault();

    if (!titulo.trim()) {
      setErro("Título é obrigatório.");
      return;
    }

    setLoading(true);
    limparMensagens();

    let acao;

    if (editandoTarefaId === null) {
      acao = criarTarefa;
    } else {
      acao = salvarEdicao;
    }

    acao()
      .then(() => {
        setMensagem(
          editandoTarefaId === null
            ? "Tarefa criada com sucesso!"
            : "Tarefa atualizada com sucesso!"
        );
        limparFormulario();
        buscarTarefas();
      })
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }

  // Entrar no modo edição
  function iniciarEdicao(tarefa) {
    limparMensagens();
    setEditandoTarefaId(tarefa.id);
    setTitulo(tarefa.titulo ?? "");
    setDescricao(tarefa.descricao ?? "");
  }

  // Cancelar edição / limpar
  function cancelar() {
    limparMensagens();
    limparFormulario();
  }

  // PUT - marcar/desmarcar concluída
  function toggleConcluida(tarefa) {
    setLoading(true);
    limparMensagens();

    fetch(`http://127.0.0.1:5153/api/tarefas/${tarefa.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concluida: !tarefa.concluida }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao atualizar status");
        return res.json();
      })
      .then(() => {
        setMensagem("Status atualizado!");
        buscarTarefas();
      })
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }

  // DELETE
  function deletarTarefa(tarefaId) {
    const confirmar = window.confirm("Tem certeza que deseja excluir esta tarefa?");
    if (!confirmar) return;

    setLoading(true);
    limparMensagens();

    fetch(`http://127.0.0.1:5153/api/tarefas/${tarefaId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao deletar tarefa");
        return res.json().catch(() => ({})); // se não vier body, não quebra
      })
      .then(() => {
        setMensagem("Tarefa deletada!");
        buscarTarefas();
      })
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }

return (
  <div className="app">
    <header className="hero">
      <h1>Simulador de Viagem</h1>
      <p>
        Organize lugares que você quer visitar e marque os destinos que você já foi.
        Tudo no clima do pôr do sol 🌅
      </p>
    </header>

    <section className="card">
      <div className="card__top">
        {/* Feedback */}
        <div className="feedback">
          {loading && <div className="badge">Carregando…</div>}
          {erro && <div className="badge badge--error">Erro: {erro}</div>}
          {mensagem && <div className="badge badge--ok">{mensagem}</div>}
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={enviarFormulario}>
          <div className="formRow">
            <input
              className="input"
              type="text"
              placeholder="Lugar (título)"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <input
              className="input"
              type="text"
              placeholder="Detalhes (descrição)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="actions">
            <button className="btn btn--primary" type="submit" disabled={loading}>
              {editandoTarefaId === null ? "Adicionar" : "Salvar alterações"}
            </button>

            <button className="btn btn--ghost" type="button" onClick={cancelar} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* LISTA */}
      <div className="card__list">
        <ul className="list">
          {tarefas.map((t) => (
            <li key={t.id} className={`item ${t.concluida ? "isDone" : ""}`}>
              <input
                className="checkbox"
                type="checkbox"
                checked={!!t.concluida}
                onChange={() => toggleConcluida(t)}
                disabled={loading}
              />

              <div className="item__text">
                <div className="title">{t.titulo}</div>
                <div className="desc">{t.descricao || <em>(sem descrição)</em>}</div>
              </div>

              <div className="item__buttons">
                <button className="btn small" type="button" onClick={() => iniciarEdicao(t)} disabled={loading}>
                  Editar
                </button>
                <button className="btn small" type="button" onClick={() => deletarTarefa(t.id)} disabled={loading}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  </div>
);


}

export default App;
