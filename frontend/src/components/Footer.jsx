import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <p>© {currentYear} Orçamento de Casamento. Todos os direitos reservados.</p>
        <p className="footer-love">Feito com ❤️ para o seu grande dia!</p>
      </div>
    </footer>
  );
};

export default Footer;
