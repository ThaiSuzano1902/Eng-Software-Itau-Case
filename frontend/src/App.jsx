import { useEffect, useState } from "react";

function App() {
  const [tarefas, setTarefas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState(""); 
  const [editandoTarefaId, setEditandoTarefaId] = useState(null);

  // GET - buscar tarefas
  useEffect(() => { //useEffect reage a mudanças ou eventos externos.
    buscarTarefas();
  }, []);

  function buscarTarefas() {
    fetch("http://127.0.0.1:5153/api/tarefas")
      .then((res) => res.json())
      .then((data) => setTarefas(data));
  }

  // POST - criar tarefa
  function criarTarefa(e) {
    e.preventDefault(); 

    fetch("http://127.0.0.1:5153/api/tarefas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titulo: titulo,
        descricao: descricao,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao criar tarefa");
        }
        return res.json();
      })
      .then(() => {
        setTitulo("");
        setDescricao("");
        buscarTarefas(); // atualiza a lista
      });
  }
  // PUT - atualizar tarefa
  function toggleConcluida(tarefa) {
  fetch(`http://127.0.0.1:5153/api/tarefas/${tarefa.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      concluida: !tarefa.concluida,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao atualizar");
      return res.json();
    })
    .then(() => buscarTarefas());
}
  function editar_tarefa(tarefaId) {
  if (editandoTarefaId !== tarefaId) {
    setEditandoTarefaId(tarefaId);
    method: "PUT",
  } else {
    setEditandoTarefaId(null);
  }

function deletarTarefa(tarefaId) {
  fetch(`http://127.0.0.1:5153/api/tarefas/${tarefaId}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao deletar");
    })
    .then(() => buscarTarefas())
    .catch((err) => console.error(err));
}

    return (
      <div>
        <h1>Lista de Tarefas</h1>

        {/* FORMULÁRIO */}
        <form onSubmit={criarTarefa}>
          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <input
            type="text"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <button type="submit">Adicionar</button>
        </form>

        <ul>
          {tarefas.map((t) => (
            <li key={t.id}>
              <input
                type="checkbox"
                checked={t.concluida}
                onChange={() => toggleConcluida(t)}
              />
              <strong style={{ marginLeft: 8 }}>{t.titulo}</strong> — {t.descricao}
              <button onClick={() => deletarTarefa(t.id)}>Excluir</button>
            </li>
          ))}
        </ul>
      </div>
    );
  
}

export default App;
