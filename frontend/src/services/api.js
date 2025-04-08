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

export default api;
