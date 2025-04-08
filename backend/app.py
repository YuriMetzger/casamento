from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configuração do banco de dados
# Usar o banco de dados na pasta instance
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///C:/temp/planilha_casamento/casamento/instance/casamento.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Modelos
class Categoria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    despesas = db.relationship('Despesa', backref='categoria', lazy=True)

class Despesa(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    descricao = db.Column(db.String(200), nullable=False)
    valor_total = db.Column(db.Float, nullable=False)
    valor_pago = db.Column(db.Float, default=0.0)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.id'), nullable=False)

class Orcamento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    valor_total = db.Column(db.Float, nullable=False)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Modelos para Notas
class Nota(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    conteudo = db.Column(db.Text, nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Modelos para Referências
class Referencia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data_casamento = db.Column(db.Date, nullable=True)
    foto_noivos = db.Column(db.String(500), nullable=True)
    logo_casamento = db.Column(db.String(500), nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cores = db.relationship('CorPaleta', backref='referencia', lazy=True, cascade='all, delete-orphan')
    fotos = db.relationship('FotoReferencia', backref='referencia', lazy=True, cascade='all, delete-orphan')

class CorPaleta(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    codigo_hex = db.Column(db.String(7), nullable=False)  # Formato: #RRGGBB
    nome = db.Column(db.String(50), nullable=True)
    referencia_id = db.Column(db.Integer, db.ForeignKey('referencia.id'), nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

class CategoriaFoto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.String(200), nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    fotos = db.relationship('FotoReferencia', backref='categoria', lazy=True)

class FotoReferencia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500), nullable=False)
    descricao = db.Column(db.String(200), nullable=True)
    referencia_id = db.Column(db.Integer, db.ForeignKey('referencia.id'), nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria_foto.id'), nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

# Modelos para Checklists
class CategoriaChecklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.String(200))
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    checklists = db.relationship('Checklist', backref='categoria_checklist', lazy=True, cascade='all, delete-orphan')

class Checklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.String(200))
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria_checklist.id'), nullable=False)
    tarefas = db.relationship('Tarefa', backref='checklist', lazy=True, cascade='all, delete-orphan')

class Tarefa(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    descricao = db.Column(db.String(200), nullable=False)
    concluida = db.Column(db.Boolean, default=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    data_conclusao = db.Column(db.DateTime)
    checklist_id = db.Column(db.Integer, db.ForeignKey('checklist.id'), nullable=False)

# Criar o banco de dados
with app.app_context():
    db.create_all()
    # Verificar se já existe um orçamento, se não, criar um padrão
    if not Orcamento.query.first():
        orcamento_inicial = Orcamento(valor_total=50000.0)  # Valor padrão inicial
        db.session.add(orcamento_inicial)
        db.session.commit()

# Rotas para Categorias
@app.route('/api/categorias', methods=['GET'])
def obter_categorias():
    categorias = Categoria.query.all()
    return jsonify([{'id': c.id, 'nome': c.nome} for c in categorias])

@app.route('/api/categorias', methods=['POST'])
def adicionar_categoria():
    dados = request.json
    nova_categoria = Categoria(nome=dados['nome'])
    db.session.add(nova_categoria)
    db.session.commit()
    return jsonify({'id': nova_categoria.id, 'nome': nova_categoria.nome}), 201

@app.route('/api/categorias/<int:id>', methods=['PUT'])
def atualizar_categoria(id):
    categoria = Categoria.query.get_or_404(id)
    dados = request.json
    categoria.nome = dados['nome']
    db.session.commit()
    return jsonify({'id': categoria.id, 'nome': categoria.nome})

@app.route('/api/categorias/<int:id>', methods=['DELETE'])
def excluir_categoria(id):
    categoria = Categoria.query.get_or_404(id)
    db.session.delete(categoria)
    db.session.commit()
    return jsonify({'mensagem': 'Categoria excluída com sucesso'})

# Rotas para Despesas
@app.route('/api/despesas', methods=['GET'])
def obter_despesas():
    despesas = Despesa.query.all()
    resultado = []
    for d in despesas:
        resultado.append({
            'id': d.id,
            'descricao': d.descricao,
            'valor_total': d.valor_total,
            'valor_pago': d.valor_pago,
            'data_criacao': d.data_criacao.isoformat(),
            'data_atualizacao': d.data_atualizacao.isoformat(),
            'categoria_id': d.categoria_id,
            'categoria_nome': d.categoria.nome
        })
    return jsonify(resultado)

@app.route('/api/despesas', methods=['POST'])
def adicionar_despesa():
    dados = request.json
    nova_despesa = Despesa(
        descricao=dados['descricao'],
        valor_total=dados['valor_total'],
        valor_pago=dados.get('valor_pago', 0.0),
        categoria_id=dados['categoria_id']
    )
    db.session.add(nova_despesa)
    db.session.commit()
    return jsonify({
        'id': nova_despesa.id,
        'descricao': nova_despesa.descricao,
        'valor_total': nova_despesa.valor_total,
        'valor_pago': nova_despesa.valor_pago,
        'categoria_id': nova_despesa.categoria_id
    }), 201

@app.route('/api/despesas/<int:id>', methods=['PUT'])
def atualizar_despesa(id):
    despesa = Despesa.query.get_or_404(id)
    dados = request.json
    despesa.descricao = dados.get('descricao', despesa.descricao)
    despesa.valor_total = dados.get('valor_total', despesa.valor_total)
    despesa.valor_pago = dados.get('valor_pago', despesa.valor_pago)
    despesa.categoria_id = dados.get('categoria_id', despesa.categoria_id)
    db.session.commit()
    return jsonify({
        'id': despesa.id,
        'descricao': despesa.descricao,
        'valor_total': despesa.valor_total,
        'valor_pago': despesa.valor_pago,
        'categoria_id': despesa.categoria_id
    })

@app.route('/api/despesas/<int:id>', methods=['DELETE'])
def excluir_despesa(id):
    despesa = Despesa.query.get_or_404(id)
    db.session.delete(despesa)
    db.session.commit()
    return jsonify({'mensagem': 'Despesa excluída com sucesso'})

# Rotas para Orçamento
@app.route('/api/orcamento', methods=['GET'])
def obter_orcamento():
    orcamento = Orcamento.query.first()
    return jsonify({
        'id': orcamento.id,
        'valor_total': orcamento.valor_total,
        'data_atualizacao': orcamento.data_atualizacao.isoformat()
    })

@app.route('/api/orcamento', methods=['PUT'])
def atualizar_orcamento():
    orcamento = Orcamento.query.first()
    dados = request.json
    orcamento.valor_total = dados['valor_total']
    db.session.commit()
    return jsonify({
        'id': orcamento.id,
        'valor_total': orcamento.valor_total,
        'data_atualizacao': orcamento.data_atualizacao.isoformat()
    })

# Rota para estatísticas
@app.route('/api/estatisticas', methods=['GET'])
def obter_estatisticas():
    orcamento = Orcamento.query.first()
    despesas = Despesa.query.all()

    total_despesas = sum(d.valor_total for d in despesas)
    total_pago = sum(d.valor_pago for d in despesas)
    saldo_restante = orcamento.valor_total - total_despesas

    # Estatísticas por categoria
    categorias = Categoria.query.all()
    estatisticas_categorias = []

    for categoria in categorias:
        despesas_categoria = Despesa.query.filter_by(categoria_id=categoria.id).all()
        total_categoria = sum(d.valor_total for d in despesas_categoria)
        pago_categoria = sum(d.valor_pago for d in despesas_categoria)

        estatisticas_categorias.append({
            'id': categoria.id,
            'nome': categoria.nome,
            'total': total_categoria,
            'pago': pago_categoria,
            'pendente': total_categoria - pago_categoria
        })

    return jsonify({
        'orcamento_total': orcamento.valor_total,
        'total_despesas': total_despesas,
        'total_pago': total_pago,
        'total_pendente': total_despesas - total_pago,
        'saldo_restante': saldo_restante,
        'percentual_gasto': (total_despesas / orcamento.valor_total) * 100 if orcamento.valor_total > 0 else 0,
        'percentual_pago': (total_pago / total_despesas) * 100 if total_despesas > 0 else 0,
        'categorias': estatisticas_categorias
    })

# Rota para a página inicial
@app.route('/', methods=['GET'])
def pagina_inicial():
    html = '''
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API de Orçamento de Casamento</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                color: #333;
            }
            h1 {
                color: #6a5acd;
                text-align: center;
                margin-bottom: 30px;
            }
            h2 {
                color: #9370db;
                margin-top: 30px;
            }
            ul {
                margin-bottom: 20px;
            }
            li {
                margin-bottom: 10px;
            }
            code {
                background-color: #f4f4f4;
                padding: 2px 5px;
                border-radius: 3px;
                font-family: monospace;
            }
            .container {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                padding: 30px;
            }
            .note {
                background-color: #e6e6fa;
                padding: 15px;
                border-radius: 5px;
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>💍 API de Orçamento de Casamento</h1>

            <p>Esta é a API para o sistema de gerenciamento de orçamento de casamento. Abaixo estão os endpoints disponíveis:</p>

            <h2>Endpoints da API:</h2>

            <ul>
                <li><code>GET /api/categorias</code> - Listar todas as categorias</li>
                <li><code>POST /api/categorias</code> - Adicionar uma nova categoria</li>
                <li><code>PUT /api/categorias/:id</code> - Atualizar uma categoria</li>
                <li><code>DELETE /api/categorias/:id</code> - Excluir uma categoria</li>
                <li><code>GET /api/despesas</code> - Listar todas as despesas</li>
                <li><code>POST /api/despesas</code> - Adicionar uma nova despesa</li>
                <li><code>PUT /api/despesas/:id</code> - Atualizar uma despesa</li>
                <li><code>DELETE /api/despesas/:id</code> - Excluir uma despesa</li>
                <li><code>GET /api/orcamento</code> - Obter o orçamento atual</li>
                <li><code>PUT /api/orcamento</code> - Atualizar o orçamento</li>
                <li><code>GET /api/estatisticas</code> - Obter estatísticas do orçamento</li>
            </ul>

            <div class="note">
                <p><strong>Nota:</strong> Esta é apenas a API backend. Para acessar a interface do usuário, você precisa iniciar o frontend separadamente.</p>
                <p>Para iniciar o frontend:</p>
                <ol>
                    <li>Navegue até a pasta do frontend</li>
                    <li>Execute <code>npm install</code> para instalar as dependências</li>
                    <li>Execute <code>npm run dev</code> para iniciar o servidor de desenvolvimento</li>
                    <li>Acesse <code>http://localhost:5173</code> no seu navegador</li>
                </ol>
            </div>
        </div>
    </body>
    </html>
    '''
    return render_template_string(html)

# Rotas para Categorias de Checklist
@app.route('/api/categorias-checklist', methods=['GET'])
def obter_categorias_checklist():
    categorias = CategoriaChecklist.query.all()
    return jsonify([{
        'id': c.id,
        'nome': c.nome,
        'descricao': c.descricao,
        'data_criacao': c.data_criacao.isoformat() if c.data_criacao else None,
        'data_atualizacao': c.data_atualizacao.isoformat() if c.data_atualizacao else None
    } for c in categorias])

@app.route('/api/categorias-checklist', methods=['POST'])
def adicionar_categoria_checklist():
    dados = request.json
    nova_categoria = CategoriaChecklist(
        nome=dados['nome'],
        descricao=dados.get('descricao', '')
    )
    db.session.add(nova_categoria)
    db.session.commit()
    return jsonify({
        'id': nova_categoria.id,
        'nome': nova_categoria.nome,
        'descricao': nova_categoria.descricao,
        'data_criacao': nova_categoria.data_criacao.isoformat() if nova_categoria.data_criacao else None,
        'data_atualizacao': nova_categoria.data_atualizacao.isoformat() if nova_categoria.data_atualizacao else None
    }), 201

@app.route('/api/categorias-checklist/<int:id>', methods=['PUT'])
def atualizar_categoria_checklist(id):
    categoria = CategoriaChecklist.query.get_or_404(id)
    dados = request.json
    categoria.nome = dados.get('nome', categoria.nome)
    categoria.descricao = dados.get('descricao', categoria.descricao)
    db.session.commit()
    return jsonify({
        'id': categoria.id,
        'nome': categoria.nome,
        'descricao': categoria.descricao,
        'data_criacao': categoria.data_criacao.isoformat() if categoria.data_criacao else None,
        'data_atualizacao': categoria.data_atualizacao.isoformat() if categoria.data_atualizacao else None
    })

@app.route('/api/categorias-checklist/<int:id>', methods=['DELETE'])
def excluir_categoria_checklist(id):
    categoria = CategoriaChecklist.query.get_or_404(id)
    db.session.delete(categoria)
    db.session.commit()
    return jsonify({'mensagem': 'Categoria de checklist excluída com sucesso'})

# Rotas para Checklists
@app.route('/api/checklists', methods=['GET'])
def obter_checklists():
    checklists = Checklist.query.all()
    resultado = []
    for c in checklists:
        categoria = CategoriaChecklist.query.get(c.categoria_id)
        resultado.append({
            'id': c.id,
            'titulo': c.titulo,
            'descricao': c.descricao,
            'data_criacao': c.data_criacao.isoformat() if c.data_criacao else None,
            'data_atualizacao': c.data_atualizacao.isoformat() if c.data_atualizacao else None,
            'categoria_id': c.categoria_id,
            'categoria_nome': categoria.nome if categoria else None
        })
    return jsonify(resultado)

@app.route('/api/categorias-checklist/<int:categoria_id>/checklists', methods=['GET'])
def obter_checklists_por_categoria(categoria_id):
    checklists = Checklist.query.filter_by(categoria_id=categoria_id).all()
    categoria = CategoriaChecklist.query.get_or_404(categoria_id)
    resultado = [{
        'id': c.id,
        'titulo': c.titulo,
        'descricao': c.descricao,
        'data_criacao': c.data_criacao.isoformat() if c.data_criacao else None,
        'data_atualizacao': c.data_atualizacao.isoformat() if c.data_atualizacao else None,
        'categoria_id': c.categoria_id,
        'categoria_nome': categoria.nome
    } for c in checklists]
    return jsonify(resultado)

@app.route('/api/checklists', methods=['POST'])
def adicionar_checklist():
    dados = request.json
    novo_checklist = Checklist(
        titulo=dados['titulo'],
        descricao=dados.get('descricao', ''),
        categoria_id=dados['categoria_id']
    )
    db.session.add(novo_checklist)
    db.session.commit()

    categoria = CategoriaChecklist.query.get(novo_checklist.categoria_id)
    return jsonify({
        'id': novo_checklist.id,
        'titulo': novo_checklist.titulo,
        'descricao': novo_checklist.descricao,
        'data_criacao': novo_checklist.data_criacao.isoformat() if novo_checklist.data_criacao else None,
        'data_atualizacao': novo_checklist.data_atualizacao.isoformat() if novo_checklist.data_atualizacao else None,
        'categoria_id': novo_checklist.categoria_id,
        'categoria_nome': categoria.nome if categoria else None
    }), 201

@app.route('/api/checklists/<int:id>', methods=['PUT'])
def atualizar_checklist(id):
    checklist = Checklist.query.get_or_404(id)
    dados = request.json
    checklist.titulo = dados.get('titulo', checklist.titulo)
    checklist.descricao = dados.get('descricao', checklist.descricao)
    checklist.categoria_id = dados.get('categoria_id', checklist.categoria_id)
    db.session.commit()

    categoria = CategoriaChecklist.query.get(checklist.categoria_id)
    return jsonify({
        'id': checklist.id,
        'titulo': checklist.titulo,
        'descricao': checklist.descricao,
        'data_criacao': checklist.data_criacao.isoformat() if checklist.data_criacao else None,
        'data_atualizacao': checklist.data_atualizacao.isoformat() if checklist.data_atualizacao else None,
        'categoria_id': checklist.categoria_id,
        'categoria_nome': categoria.nome if categoria else None
    })

@app.route('/api/checklists/<int:id>', methods=['DELETE'])
def excluir_checklist(id):
    checklist = Checklist.query.get_or_404(id)
    db.session.delete(checklist)
    db.session.commit()
    return jsonify({'mensagem': 'Checklist excluído com sucesso'})

# Rotas para Tarefas
@app.route('/api/categorias-checklist/<int:categoria_id>/tarefas', methods=['GET'])
def obter_tarefas_por_categoria(categoria_id):
    # Obter todos os checklists da categoria
    checklists = Checklist.query.filter_by(categoria_id=categoria_id).all()

    # Obter todas as tarefas de todos os checklists da categoria
    resultado = []
    for checklist in checklists:
        tarefas = Tarefa.query.filter_by(checklist_id=checklist.id).all()
        for t in tarefas:
            resultado.append({
                'id': t.id,
                'descricao': t.descricao,
                'concluida': t.concluida,
                'data_criacao': t.data_criacao.isoformat() if t.data_criacao else None,
                'data_atualizacao': t.data_atualizacao.isoformat() if t.data_atualizacao else None,
                'data_conclusao': t.data_conclusao.isoformat() if t.data_conclusao else None,
                'checklist_id': t.checklist_id,
                'checklist_titulo': checklist.titulo
            })

    return jsonify(resultado)

@app.route('/api/checklists/<int:checklist_id>/tarefas', methods=['GET'])
def obter_tarefas_por_checklist(checklist_id):
    tarefas = Tarefa.query.filter_by(checklist_id=checklist_id).all()
    checklist = Checklist.query.get_or_404(checklist_id)

    return jsonify([{
        'id': t.id,
        'descricao': t.descricao,
        'concluida': t.concluida,
        'data_criacao': t.data_criacao.isoformat() if t.data_criacao else None,
        'data_atualizacao': t.data_atualizacao.isoformat() if t.data_atualizacao else None,
        'data_conclusao': t.data_conclusao.isoformat() if t.data_conclusao else None,
        'checklist_id': t.checklist_id,
        'checklist_titulo': checklist.titulo
    } for t in tarefas])

@app.route('/api/tarefas', methods=['POST'])
def adicionar_tarefa():
    dados = request.json

    # Se recebemos categoria_id em vez de checklist_id, precisamos criar ou obter um checklist padrão
    if 'categoria_id' in dados and 'checklist_id' not in dados:
        categoria_id = dados['categoria_id']
        # Verificar se já existe um checklist padrão para esta categoria
        checklist = Checklist.query.filter_by(categoria_id=categoria_id, titulo='Tarefas').first()

        if not checklist:
            # Criar um checklist padrão para a categoria
            checklist = Checklist(
                titulo='Tarefas',
                descricao='Lista de tarefas',
                categoria_id=categoria_id
            )
            db.session.add(checklist)
            db.session.commit()

        checklist_id = checklist.id
    else:
        checklist_id = dados['checklist_id']

    nova_tarefa = Tarefa(
        descricao=dados['descricao'],
        concluida=dados.get('concluida', False),
        checklist_id=checklist_id,
        data_conclusao=datetime.fromisoformat(dados['data_conclusao']) if dados.get('data_conclusao') else None
    )
    db.session.add(nova_tarefa)
    db.session.commit()

    checklist = Checklist.query.get(nova_tarefa.checklist_id)

    return jsonify({
        'id': nova_tarefa.id,
        'descricao': nova_tarefa.descricao,
        'concluida': nova_tarefa.concluida,
        'data_criacao': nova_tarefa.data_criacao.isoformat() if nova_tarefa.data_criacao else None,
        'data_atualizacao': nova_tarefa.data_atualizacao.isoformat() if nova_tarefa.data_atualizacao else None,
        'data_conclusao': nova_tarefa.data_conclusao.isoformat() if nova_tarefa.data_conclusao else None,
        'checklist_id': nova_tarefa.checklist_id,
        'checklist_titulo': checklist.titulo if checklist else None
    }), 201

@app.route('/api/tarefas/<int:id>', methods=['PUT'])
def atualizar_tarefa(id):
    tarefa = Tarefa.query.get_or_404(id)
    dados = request.json
    tarefa.descricao = dados.get('descricao', tarefa.descricao)

    # Se a tarefa foi marcada como concluída e não estava antes, atualizar a data de conclusão
    if dados.get('concluida', tarefa.concluida) and not tarefa.concluida:
        tarefa.data_conclusao = datetime.utcnow()
    # Se a tarefa foi desmarcada, remover a data de conclusão
    elif not dados.get('concluida', tarefa.concluida) and tarefa.concluida:
        tarefa.data_conclusao = None

    tarefa.concluida = dados.get('concluida', tarefa.concluida)
    # Se recebemos categoria_id, precisamos atualizar o checklist_id
    if 'categoria_id' in dados:
        categoria_id = dados['categoria_id']
        # Verificar se já existe um checklist padrão para esta categoria
        checklist = Checklist.query.filter_by(categoria_id=categoria_id, titulo='Tarefas').first()

        if not checklist:
            # Criar um checklist padrão para a categoria
            checklist = Checklist(
                titulo='Tarefas',
                descricao='Lista de tarefas',
                categoria_id=categoria_id
            )
            db.session.add(checklist)
            db.session.commit()

        tarefa.checklist_id = checklist.id
    else:
        tarefa.checklist_id = dados.get('checklist_id', tarefa.checklist_id)

    db.session.commit()
    return jsonify({
        'id': tarefa.id,
        'descricao': tarefa.descricao,
        'concluida': tarefa.concluida,
        'data_criacao': tarefa.data_criacao.isoformat() if tarefa.data_criacao else None,
        'data_atualizacao': tarefa.data_atualizacao.isoformat() if tarefa.data_atualizacao else None,
        'data_conclusao': tarefa.data_conclusao.isoformat() if tarefa.data_conclusao else None,
        'checklist_id': tarefa.checklist_id
    })

@app.route('/api/tarefas/<int:id>', methods=['DELETE'])
def excluir_tarefa(id):
    tarefa = Tarefa.query.get_or_404(id)
    db.session.delete(tarefa)
    db.session.commit()
    return jsonify({'mensagem': 'Tarefa excluída com sucesso'})

# Rota para estatísticas de checklists
@app.route('/api/estatisticas-checklists', methods=['GET'])
def obter_estatisticas_checklists():
    categorias = CategoriaChecklist.query.all()
    resultado = []

    total_tarefas = 0
    total_concluidas = 0

    for categoria in categorias:
        checklists = Checklist.query.filter_by(categoria_id=categoria.id).all()
        categoria_tarefas = 0
        categoria_concluidas = 0

        checklists_info = []
        for checklist in checklists:
            tarefas = Tarefa.query.filter_by(checklist_id=checklist.id).all()
            total_checklist = len(tarefas)
            concluidas_checklist = sum(1 for t in tarefas if t.concluida)

            categoria_tarefas += total_checklist
            categoria_concluidas += concluidas_checklist

            checklists_info.append({
                'id': checklist.id,
                'titulo': checklist.titulo,
                'total_tarefas': total_checklist,
                'tarefas_concluidas': concluidas_checklist,
                'percentual': (concluidas_checklist / total_checklist * 100) if total_checklist > 0 else 0
            })

        total_tarefas += categoria_tarefas
        total_concluidas += categoria_concluidas

        resultado.append({
            'id': categoria.id,
            'nome': categoria.nome,
            'total_tarefas': categoria_tarefas,
            'tarefas_concluidas': categoria_concluidas,
            'percentual': (categoria_concluidas / categoria_tarefas * 100) if categoria_tarefas > 0 else 0,
            'checklists': checklists_info
        })

    return jsonify({
        'categorias': resultado,
        'total_tarefas': total_tarefas,
        'total_concluidas': total_concluidas,
        'percentual_geral': (total_concluidas / total_tarefas * 100) if total_tarefas > 0 else 0
    })

# Rotas para Referências
@app.route('/api/referencias', methods=['GET'])
def obter_referencias():
    referencias = Referencia.query.all()
    resultado = []

    for ref in referencias:
        cores = CorPaleta.query.filter_by(referencia_id=ref.id).all()
        fotos = FotoReferencia.query.filter_by(referencia_id=ref.id).all()

        fotos_data = []
        for foto in fotos:
            categoria = CategoriaFoto.query.get(foto.categoria_id) if foto.categoria_id else None
            fotos_data.append({
                'id': foto.id,
                'url': foto.url,
                'descricao': foto.descricao,
                'categoria_id': foto.categoria_id,
                'categoria_nome': categoria.nome if categoria else None,
                'data_criacao': foto.data_criacao.isoformat() if foto.data_criacao else None
            })

        resultado.append({
            'id': ref.id,
            'data_casamento': ref.data_casamento.isoformat() if ref.data_casamento else None,
            'foto_noivos': ref.foto_noivos,
            'logo_casamento': ref.logo_casamento,
            'data_criacao': ref.data_criacao.isoformat() if ref.data_criacao else None,
            'data_atualizacao': ref.data_atualizacao.isoformat() if ref.data_atualizacao else None,
            'cores': [{
                'id': cor.id,
                'codigo_hex': cor.codigo_hex,
                'nome': cor.nome
            } for cor in cores],
            'fotos': fotos_data
        })

    return jsonify(resultado)

@app.route('/api/referencias/<int:id>', methods=['GET'])
def obter_referencia(id):
    ref = Referencia.query.get_or_404(id)
    cores = CorPaleta.query.filter_by(referencia_id=ref.id).all()
    fotos = FotoReferencia.query.filter_by(referencia_id=ref.id).all()

    fotos_data = []
    for foto in fotos:
        categoria = CategoriaFoto.query.get(foto.categoria_id) if foto.categoria_id else None
        fotos_data.append({
            'id': foto.id,
            'url': foto.url,
            'descricao': foto.descricao,
            'categoria_id': foto.categoria_id,
            'categoria_nome': categoria.nome if categoria else None,
            'data_criacao': foto.data_criacao.isoformat() if foto.data_criacao else None
        })

    return jsonify({
        'id': ref.id,
        'data_casamento': ref.data_casamento.isoformat() if ref.data_casamento else None,
        'foto_noivos': ref.foto_noivos,
        'logo_casamento': ref.logo_casamento,
        'data_criacao': ref.data_criacao.isoformat() if ref.data_criacao else None,
        'data_atualizacao': ref.data_atualizacao.isoformat() if ref.data_atualizacao else None,
        'cores': [{
            'id': cor.id,
            'codigo_hex': cor.codigo_hex,
            'nome': cor.nome
        } for cor in cores],
        'fotos': fotos_data
    })

@app.route('/api/referencias', methods=['POST'])
def adicionar_referencia():
    dados = request.json

    # Converter a data de string para objeto Date, se fornecida
    data_casamento = None
    if dados.get('data_casamento'):
        try:
            data_casamento = datetime.fromisoformat(dados['data_casamento']).date()
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido. Use o formato ISO (YYYY-MM-DD)'}), 400

    nova_referencia = Referencia(
        data_casamento=data_casamento,
        foto_noivos=dados.get('foto_noivos'),
        logo_casamento=dados.get('logo_casamento')
    )

    db.session.add(nova_referencia)
    db.session.commit()

    # Adicionar cores, se fornecidas
    if 'cores' in dados and isinstance(dados['cores'], list):
        for cor_data in dados['cores']:
            nova_cor = CorPaleta(
                codigo_hex=cor_data['codigo_hex'],
                nome=cor_data.get('nome'),
                referencia_id=nova_referencia.id
            )
            db.session.add(nova_cor)

    db.session.commit()

    return jsonify({
        'id': nova_referencia.id,
        'data_casamento': nova_referencia.data_casamento.isoformat() if nova_referencia.data_casamento else None,
        'foto_noivos': nova_referencia.foto_noivos,
        'logo_casamento': nova_referencia.logo_casamento,
        'data_criacao': nova_referencia.data_criacao.isoformat() if nova_referencia.data_criacao else None,
        'data_atualizacao': nova_referencia.data_atualizacao.isoformat() if nova_referencia.data_atualizacao else None
    }), 201

@app.route('/api/referencias/<int:id>', methods=['PUT'])
def atualizar_referencia(id):
    ref = Referencia.query.get_or_404(id)
    dados = request.json

    # Atualizar data do casamento, se fornecida
    if 'data_casamento' in dados:
        if dados['data_casamento']:
            try:
                ref.data_casamento = datetime.fromisoformat(dados['data_casamento']).date()
            except ValueError:
                return jsonify({'erro': 'Formato de data inválido. Use o formato ISO (YYYY-MM-DD)'}), 400
        else:
            ref.data_casamento = None

    # Atualizar outros campos
    if 'foto_noivos' in dados:
        ref.foto_noivos = dados['foto_noivos']

    if 'logo_casamento' in dados:
        ref.logo_casamento = dados['logo_casamento']

    db.session.commit()

    return jsonify({
        'id': ref.id,
        'data_casamento': ref.data_casamento.isoformat() if ref.data_casamento else None,
        'foto_noivos': ref.foto_noivos,
        'logo_casamento': ref.logo_casamento,
        'data_criacao': ref.data_criacao.isoformat() if ref.data_criacao else None,
        'data_atualizacao': ref.data_atualizacao.isoformat() if ref.data_atualizacao else None
    })

@app.route('/api/referencias/<int:id>', methods=['DELETE'])
def excluir_referencia(id):
    ref = Referencia.query.get_or_404(id)
    db.session.delete(ref)
    db.session.commit()
    return jsonify({'mensagem': 'Referência excluída com sucesso'})

# Rotas para Cores da Paleta
@app.route('/api/referencias/<int:referencia_id>/cores', methods=['GET'])
def obter_cores(referencia_id):
    cores = CorPaleta.query.filter_by(referencia_id=referencia_id).all()
    return jsonify([{
        'id': cor.id,
        'codigo_hex': cor.codigo_hex,
        'nome': cor.nome,
        'referencia_id': cor.referencia_id,
        'data_criacao': cor.data_criacao.isoformat() if cor.data_criacao else None
    } for cor in cores])

@app.route('/api/cores', methods=['POST'])
def adicionar_cor():
    dados = request.json
    nova_cor = CorPaleta(
        codigo_hex=dados['codigo_hex'],
        nome=dados.get('nome'),
        referencia_id=dados['referencia_id']
    )
    db.session.add(nova_cor)
    db.session.commit()

    return jsonify({
        'id': nova_cor.id,
        'codigo_hex': nova_cor.codigo_hex,
        'nome': nova_cor.nome,
        'referencia_id': nova_cor.referencia_id,
        'data_criacao': nova_cor.data_criacao.isoformat() if nova_cor.data_criacao else None
    }), 201

@app.route('/api/cores/<int:id>', methods=['DELETE'])
def excluir_cor(id):
    cor = CorPaleta.query.get_or_404(id)
    db.session.delete(cor)
    db.session.commit()
    return jsonify({'mensagem': 'Cor excluída com sucesso'})

# Rotas para Categorias de Fotos
@app.route('/api/categorias-foto', methods=['GET'])
def obter_categorias_foto():
    categorias = CategoriaFoto.query.all()
    return jsonify([{
        'id': cat.id,
        'nome': cat.nome,
        'descricao': cat.descricao,
        'data_criacao': cat.data_criacao.isoformat() if cat.data_criacao else None
    } for cat in categorias])

@app.route('/api/categorias-foto', methods=['POST'])
def adicionar_categoria_foto():
    dados = request.json
    nova_categoria = CategoriaFoto(
        nome=dados['nome'],
        descricao=dados.get('descricao')
    )
    db.session.add(nova_categoria)
    db.session.commit()

    return jsonify({
        'id': nova_categoria.id,
        'nome': nova_categoria.nome,
        'descricao': nova_categoria.descricao,
        'data_criacao': nova_categoria.data_criacao.isoformat() if nova_categoria.data_criacao else None
    }), 201

@app.route('/api/categorias-foto/<int:id>', methods=['DELETE'])
def excluir_categoria_foto(id):
    categoria = CategoriaFoto.query.get_or_404(id)
    db.session.delete(categoria)
    db.session.commit()
    return jsonify({'mensagem': 'Categoria de foto excluída com sucesso'})

# Rotas para Fotos de Referência
@app.route('/api/referencias/<int:referencia_id>/fotos', methods=['GET'])
def obter_fotos(referencia_id):
    fotos = FotoReferencia.query.filter_by(referencia_id=referencia_id).all()
    resultado = []

    for foto in fotos:
        categoria = CategoriaFoto.query.get(foto.categoria_id) if foto.categoria_id else None
        resultado.append({
            'id': foto.id,
            'url': foto.url,
            'descricao': foto.descricao,
            'referencia_id': foto.referencia_id,
            'categoria_id': foto.categoria_id,
            'categoria_nome': categoria.nome if categoria else None,
            'data_criacao': foto.data_criacao.isoformat() if foto.data_criacao else None
        })

    return jsonify(resultado)

@app.route('/api/fotos', methods=['POST'])
def adicionar_foto():
    dados = request.json
    nova_foto = FotoReferencia(
        url=dados['url'],
        descricao=dados.get('descricao'),
        referencia_id=dados['referencia_id'],
        categoria_id=dados.get('categoria_id')
    )
    db.session.add(nova_foto)
    db.session.commit()

    categoria = CategoriaFoto.query.get(nova_foto.categoria_id) if nova_foto.categoria_id else None

    return jsonify({
        'id': nova_foto.id,
        'url': nova_foto.url,
        'descricao': nova_foto.descricao,
        'referencia_id': nova_foto.referencia_id,
        'categoria_id': nova_foto.categoria_id,
        'categoria_nome': categoria.nome if categoria else None,
        'data_criacao': nova_foto.data_criacao.isoformat() if nova_foto.data_criacao else None
    }), 201

@app.route('/api/fotos/<int:id>', methods=['PUT'])
def atualizar_foto(id):
    foto = FotoReferencia.query.get_or_404(id)
    dados = request.json

    if 'url' in dados:
        foto.url = dados['url']

    if 'descricao' in dados:
        foto.descricao = dados['descricao']

    if 'categoria_id' in dados:
        foto.categoria_id = dados['categoria_id']

    db.session.commit()

    categoria = CategoriaFoto.query.get(foto.categoria_id) if foto.categoria_id else None

    return jsonify({
        'id': foto.id,
        'url': foto.url,
        'descricao': foto.descricao,
        'referencia_id': foto.referencia_id,
        'categoria_id': foto.categoria_id,
        'categoria_nome': categoria.nome if categoria else None,
        'data_criacao': foto.data_criacao.isoformat() if foto.data_criacao else None
    })

@app.route('/api/fotos/<int:id>', methods=['DELETE'])
def excluir_foto(id):
    foto = FotoReferencia.query.get_or_404(id)
    db.session.delete(foto)
    db.session.commit()
    return jsonify({'mensagem': 'Foto excluída com sucesso'})

# Rotas para Notas
@app.route('/api/notas', methods=['GET'])
def obter_notas():
    notas = Nota.query.order_by(Nota.data_atualizacao.desc()).all()
    return jsonify([{
        'id': nota.id,
        'titulo': nota.titulo,
        'conteudo': nota.conteudo,
        'data_criacao': nota.data_criacao.isoformat() if nota.data_criacao else None,
        'data_atualizacao': nota.data_atualizacao.isoformat() if nota.data_atualizacao else None
    } for nota in notas])

@app.route('/api/notas/<int:id>', methods=['GET'])
def obter_nota(id):
    nota = Nota.query.get_or_404(id)
    return jsonify({
        'id': nota.id,
        'titulo': nota.titulo,
        'conteudo': nota.conteudo,
        'data_criacao': nota.data_criacao.isoformat() if nota.data_criacao else None,
        'data_atualizacao': nota.data_atualizacao.isoformat() if nota.data_atualizacao else None
    })

@app.route('/api/notas', methods=['POST'])
def adicionar_nota():
    dados = request.json
    nova_nota = Nota(
        titulo=dados['titulo'],
        conteudo=dados.get('conteudo', '')
    )
    db.session.add(nova_nota)
    db.session.commit()

    return jsonify({
        'id': nova_nota.id,
        'titulo': nova_nota.titulo,
        'conteudo': nova_nota.conteudo,
        'data_criacao': nova_nota.data_criacao.isoformat() if nova_nota.data_criacao else None,
        'data_atualizacao': nova_nota.data_atualizacao.isoformat() if nova_nota.data_atualizacao else None
    }), 201

@app.route('/api/notas/<int:id>', methods=['PUT'])
def atualizar_nota(id):
    nota = Nota.query.get_or_404(id)
    dados = request.json

    if 'titulo' in dados:
        nota.titulo = dados['titulo']

    if 'conteudo' in dados:
        nota.conteudo = dados['conteudo']

    db.session.commit()

    return jsonify({
        'id': nota.id,
        'titulo': nota.titulo,
        'conteudo': nota.conteudo,
        'data_criacao': nota.data_criacao.isoformat() if nota.data_criacao else None,
        'data_atualizacao': nota.data_atualizacao.isoformat() if nota.data_atualizacao else None
    })

@app.route('/api/notas/<int:id>', methods=['DELETE'])
def excluir_nota(id):
    nota = Nota.query.get_or_404(id)
    db.session.delete(nota)
    db.session.commit()
    return jsonify({'mensagem': 'Nota excluída com sucesso'})

if __name__ == '__main__':
    app.run(debug=True)
