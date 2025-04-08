import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Despesas from './pages/Despesas';
import Categorias from './pages/Categorias';
import Orcamento from './pages/Orcamento';
import Checklists from './pages/Checklists';
import Referencias from './pages/Referencias';
import Notas from './pages/Notas';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/despesas" element={<Despesas />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/orcamento" element={<Orcamento />} />
            <Route path="/checklists/*" element={<Checklists />} />
            <Route path="/referencias/*" element={<Referencias />} />
            <Route path="/notas/*" element={<Notas />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
