import { useState } from 'react';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import './ChecklistForms.css';

const CategoriaChecklistForm = ({ categoria = null, onSalvar, onCancelar }) => {
  const [formData, setFormData] = useState({
    nome: categoria?.nome || '',
    descricao: categoria?.descricao || '',
    tarefas: categoria?.tarefas || []
  });

  const [novaTarefa, setNovaTarefa] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleTarefaChange = (e) => {
    setNovaTarefa(e.target.value);

    if (errors.tarefas) {
      setErrors(prev => ({
        ...prev,
        tarefas: null
      }));
    }
  };

  const adicionarTarefa = () => {
    if (novaTarefa.trim()) {
      setFormData(prev => ({
        ...prev,
        tarefas: [...prev.tarefas, { descricao: novaTarefa.trim(), concluida: false }]
      }));
      setNovaTarefa('');
    }
  };

  const removerTarefa = (index) => {
    setFormData(prev => ({
      ...prev,
      tarefas: prev.tarefas.filter((_, i) => i !== index)
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarTarefa();
    }
  };

  const validarForm = () => {
    const novosErros = {};

    if (!formData.nome.trim()) {
      novosErros.nome = 'O nome da categoria é obrigatório';
    }

    // Tarefas são opcionais

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validarForm()) {
      onSalvar(formData);
    }
  };

  return (
    <div className="checklist-form-container">
      <form onSubmit={handleSubmit} className="checklist-form">
        <div className="form-group">
          <label htmlFor="nome">Nome da Categoria *</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Ex: Cerimônia, Festa, Lua de Mel"
            className={errors.nome ? 'error' : ''}
          />
          {errors.nome && <div className="error-message">{errors.nome}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descrição opcional para esta categoria"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Tarefas</label>
          <div className="tarefa-input-container">
            <input
              type="text"
              value={novaTarefa}
              onChange={handleTarefaChange}
              onKeyDown={handleKeyDown}
              placeholder="Digite uma nova tarefa e pressione Enter ou clique em Adicionar"
            />
            <button
              type="button"
              className="btn-add-tarefa"
              onClick={adicionarTarefa}
            >
              <FaPlus /> Adicionar
            </button>
          </div>

          <div className="tarefas-list">
            {formData.tarefas.length === 0 ? (
              <div className="no-tarefas">Nenhuma tarefa adicionada</div>
            ) : (
              formData.tarefas.map((tarefa, index) => (
                <div key={index} className="tarefa-item">
                  <span className="tarefa-descricao">{tarefa.descricao}</span>
                  <button
                    type="button"
                    className="btn-remove-tarefa"
                    onClick={() => removerTarefa(index)}
                    title="Remover tarefa"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="form-actions">
          {onCancelar && (
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancelar}
            >
              <FaTimes /> Cancelar
            </button>
          )}
          <button type="submit" className="btn-save">
            <FaSave /> Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoriaChecklistForm;
