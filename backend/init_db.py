from app import app, db, Categoria

# Lista de categorias comuns em casamentos
categorias_casamento = [
    "Buffet e Alimentação",
    "Local da Cerimônia",
    "Local da Recepção",
    "Decoração",
    "Fotografia e Vídeo",
    "Música e Entretenimento",
    "Vestido e Traje",
    "Alianças",
    "Convites e Papelaria",
    "Lembrancinhas",
    "Lua de Mel",
    "Beleza e Bem-estar",
    "Transporte",
    "Outros"
]

def inicializar_categorias():
    with app.app_context():
        # Verificar se já existem categorias
        if Categoria.query.count() == 0:
            for nome_categoria in categorias_casamento:
                categoria = Categoria(nome=nome_categoria)
                db.session.add(categoria)
            
            db.session.commit()
            print("Categorias inicializadas com sucesso!")
        else:
            print("O banco de dados já possui categorias. Nenhuma alteração foi feita.")

if __name__ == "__main__":
    inicializar_categorias()
