from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

#Flask cria o meu servidor, request é uma requisição, 
#SQALchemy conversa com o mueu banco de dados

app = Flask(__name__)
CORS(app)

# Banco SQLite (arquivo local)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///site.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

class Tarefa(db.Model): 
    __tablename__ = "tarefas"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    concluida = db.Column(db.Boolean, default=False, nullable=False)
    data_criacao = db.Column(db.DateTime, server_default=db.func.current_timestamp())

    def dicio(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "descricao": self.descricao,
            "concluida": self.concluida,
            "data_criacao": self.data_criacao.isoformat() if self.data_criacao else None,
        }


# GET - listar todas
@app.route("/api/tarefas", methods=["GET"])
def listar_tarefas():
    tarefas = Tarefa.query.all() 
    return jsonify([t.dicio() for t in tarefas]), 200 

# POST - criar nova tarefa
@app.route("/api/tarefas", methods=["POST"])
def criar_tarefa():
    dados = request.get_json(silent=True)

    if not dados:
        return jsonify({"erro": "JSON inválido ou ausente"})

    titulo = dados.get("titulo")
    descricao = dados.get("descricao")

    if not titulo or not str(titulo).strip():
        return jsonify({"erro": "titulo é obrigatório"}), 400

    nova = Tarefa(titulo=str(titulo).strip(), descricao=descricao)
    db.session.add(nova)
    db.session.commit()

    return jsonify(nova.dicio()), 201


# GET - buscar por id
@app.route("/api/tarefas/<int:id>", methods=["GET"])
def buscar_tarefa(id):
    tarefa = Tarefa.query.get(id)
    if not tarefa:
        return jsonify({"erro": "tarefa não encontrada"}), 404

    return jsonify(tarefa.dicio()), 200


# PUT - atualizar
@app.route("/api/tarefas/<int:id>", methods=["PUT"])
def atualizar_tarefa(id):
    tarefa = Tarefa.query.get(id)
    if not tarefa:
        return jsonify({"erro": "tarefa não encontrada"}), 404

    dados = request.get_json(silent=True)
    if not dados:
        return jsonify({"erro": "JSON inválido ou ausente"}), 400

    if "titulo" in dados:
        if not str(dados["titulo"]).strip():
            return jsonify({"erro": "titulo é obrigatório"}), 400
        tarefa.titulo = str(dados["titulo"]).strip()

    if "descricao" in dados:
        tarefa.descricao = dados["descricao"]

    if "concluida" in dados:
        tarefa.concluida = bool(dados["concluida"])

    db.session.commit()
    return jsonify(tarefa.dicio()), 200

# DELETE /api/tarefas/<id> - deletar
@app.route("/api/tarefas/<int:id>", methods=["DELETE"])
def deletar_tarefa(id):
    tarefa = Tarefa.query.get(id)
    if not tarefa:
        return jsonify({"erro": "tarefa não encontrada"}), 404

    db.session.delete(tarefa)
    db.session.commit()
    return jsonify({"mensagem": "tarefa deletada com sucesso"}), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5153)
