import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Serviços para Categorias
export const categoriasService = {
  listarTodas: async () => {
    const response = await api.get('/categorias');
    return response.data;
  },

  adicionar: async (categoria) => {
    const response = await api.post('/categorias', categoria);
    return response.data;
  },

  atualizar: async (id, categoria) => {
    const response = await api.put(`/categorias/${id}`, categoria);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/categorias/${id}`);
    return response.data;
  }
};

// Serviços para Despesas
export const despesasService = {
  listarTodas: async () => {
    const response = await api.get('/despesas');
    return response.data;
  },

  adicionar: async (despesa) => {
    const response = await api.post('/despesas', despesa);
    return response.data;
  },

  atualizar: async (id, despesa) => {
    const response = await api.put(`/despesas/${id}`, despesa);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/despesas/${id}`);
    return response.data;
  }
};

// Serviços para Orçamento
export const orcamentoService = {
  obter: async () => {
    const response = await api.get('/orcamento');
    return response.data;
  },

  atualizar: async (orcamento) => {
    const response = await api.put('/orcamento', orcamento);
    return response.data;
  }
};

// Serviços para Estatísticas
export const estatisticasService = {
  obter: async () => {
    const response = await api.get('/estatisticas');
    return response.data;
  }
};

// Serviços para Categorias de Checklist
export const categoriasChecklistService = {
  listarTodas: async () => {
    const response = await api.get('/categorias-checklist');
    return response.data;
  },

  adicionar: async (categoria) => {
    const response = await api.post('/categorias-checklist', categoria);
    return response.data;
  },

  atualizar: async (id, categoria) => {
    const response = await api.put(`/categorias-checklist/${id}`, categoria);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/categorias-checklist/${id}`);
    return response.data;
  }
};

// Serviços para Checklists
export const checklistsService = {
  listarTodos: async () => {
    const response = await api.get('/checklists');
    return response.data;
  },

  listarPorCategoria: async (categoriaId) => {
    const response = await api.get(`/categorias-checklist/${categoriaId}/checklists`);
    return response.data;
  },

  adicionar: async (checklist) => {
    const response = await api.post('/checklists', checklist);
    return response.data;
  },

  atualizar: async (id, checklist) => {
    const response = await api.put(`/checklists/${id}`, checklist);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/checklists/${id}`);
    return response.data;
  }
};

// Serviços para Tarefas
export const tarefasService = {
  listarPorChecklist: async (checklistId) => {
    const response = await api.get(`/checklists/${checklistId}/tarefas`);
    return response.data;
  },

  listarPorCategoria: async (categoriaId) => {
    const response = await api.get(`/categorias-checklist/${categoriaId}/tarefas`);
    return response.data;
  },

  adicionar: async (tarefa) => {
    const response = await api.post('/tarefas', tarefa);
    return response.data;
  },

  atualizar: async (id, tarefa) => {
    const response = await api.put(`/tarefas/${id}`, tarefa);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/tarefas/${id}`);
    return response.data;
  },

  marcarConcluida: async (id, concluida = true) => {
    const response = await api.put(`/tarefas/${id}`, { concluida });
    return response.data;
  }
};

// Serviços para Estatísticas de Checklists
export const estatisticasChecklistService = {
  obter: async () => {
    const response = await api.get('/estatisticas-checklists');
    return response.data;
  }
};

// Serviços para Referências
export const referenciasService = {
  listarTodas: async () => {
    const response = await api.get('/referencias');
    return response.data;
  },

  obterPorId: async (id) => {
    const response = await api.get(`/referencias/${id}`);
    return response.data;
  },

  adicionar: async (referencia) => {
    const response = await api.post('/referencias', referencia);
    return response.data;
  },

  atualizar: async (id, referencia) => {
    const response = await api.put(`/referencias/${id}`, referencia);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/referencias/${id}`);
    return response.data;
  }
};

// Serviços para Cores da Paleta
export const coresService = {
  listarPorReferencia: async (referenciaId) => {
    const response = await api.get(`/referencias/${referenciaId}/cores`);
    return response.data;
  },

  adicionar: async (cor) => {
    const response = await api.post('/cores', cor);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/cores/${id}`);
    return response.data;
  }
};

// Serviços para Categorias de Fotos
export const categoriasFotoService = {
  listarTodas: async () => {
    const response = await api.get('/categorias-foto');
    return response.data;
  },

  adicionar: async (categoria) => {
    const response = await api.post('/categorias-foto', categoria);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/categorias-foto/${id}`);
    return response.data;
  }
};

// Serviços para Fotos de Referência
export const fotosService = {
  listarPorReferencia: async (referenciaId) => {
    const response = await api.get(`/referencias/${referenciaId}/fotos`);
    return response.data;
  },

  adicionar: async (foto) => {
    const response = await api.post('/fotos', foto);
    return response.data;
  },

  atualizar: async (id, foto) => {
    const response = await api.put(`/fotos/${id}`, foto);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/fotos/${id}`);
    return response.data;
  }
};

// Serviços para Notas
export const notasService = {
  listarTodas: async () => {
    const response = await api.get('/notas');
    return response.data;
  },

  obterPorId: async (id) => {
    const response = await api.get(`/notas/${id}`);
    return response.data;
  },

  adicionar: async (nota) => {
    const response = await api.post('/notas', nota);
    return response.data;
  },

  atualizar: async (id, nota) => {
    const response = await api.put(`/notas/${id}`, nota);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/notas/${id}`);
    return response.data;
  }
};

export default api;
