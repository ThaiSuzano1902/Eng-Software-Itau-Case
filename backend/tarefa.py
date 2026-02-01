class Tarefa:
    def __init__(self, titulo, descricao=None):
        if not titulo or not titulo.strip():
            raise ValueError("Título é obrigatório")
#Esses campos começam vazios porque quem gera é o banco de dados no momento do INSERT.
        self.id = None              # será gerado pelo banco
        self.titulo = titulo
        self.descricao = descricao
        self.concluida = False      # padrão do case
        self.data_criacao = None    # gerada automaticamente pelo banco

    def marcar_concluida(self):
        self.concluida = True

    def marcar_pendente(self):
        self.concluida = False

    def atualizar(self, titulo=None, descricao=None, concluida=None):
        if titulo is not None:
            if not titulo.strip():
                raise ValueError("Título é obrigatório")
            self.titulo = titulo

        if descricao is not None:
            self.descricao = descricao

        if concluida is not None:
            self.concluida = concluida
