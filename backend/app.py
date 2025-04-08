from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///casamento.db'
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

if __name__ == '__main__':
    app.run(debug=True)
