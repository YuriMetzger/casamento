import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaMoneyBillWave, FaListAlt, FaCog, FaCheckSquare } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">💍</span>
          <span className="logo-text">Orçamento de Casamento</span>
        </Link>

        <ul className="navbar-links">
          <li className={location.pathname === '/' ? 'active' : ''}>
            <Link to="/">
              <FaHome />
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={location.pathname === '/despesas' ? 'active' : ''}>
            <Link to="/despesas">
              <FaMoneyBillWave />
              <span>Despesas</span>
            </Link>
          </li>
          <li className={location.pathname === '/categorias' ? 'active' : ''}>
            <Link to="/categorias">
              <FaListAlt />
              <span>Categorias</span>
            </Link>
          </li>
          <li className={location.pathname === '/orcamento' ? 'active' : ''}>
            <Link to="/orcamento">
              <FaCog />
              <span>Orçamento</span>
            </Link>
          </li>
          <li className={location.pathname.startsWith('/checklists') ? 'active' : ''}>
            <Link to="/checklists">
              <FaCheckSquare />
              <span>Checklists</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
