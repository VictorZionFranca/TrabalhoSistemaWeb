// src/components/Footer.tsx

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="py-8 bg-blue-700 flex items-center justify-center">
        <p className="text-white text-center">
          &copy; {new Date().getFullYear()} / Feito Por Zion
        </p>
      </div>
    </footer>
  );
};

export default Footer;
