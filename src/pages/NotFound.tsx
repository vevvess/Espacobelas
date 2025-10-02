import { Link } from "react-router-dom";
import { FiHome, FiHeart } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bella-50 via-white to-bella-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-bella-500 to-bella-400 rounded-2xl mb-6">
          <FiHeart className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-6xl font-bold text-bella-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-bella-800 mb-2">
          Página não encontrada
        </h2>
        <p className="text-bella-600 mb-8">
          Ops! A página que você está procurando não existe no Espaço Bella's.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-bella-500 to-bella-400 text-white font-semibold py-3 px-6 rounded-lg hover:from-bella-600 hover:to-bella-500 transition-all duration-200 bella-shadow"
        >
          <FiHome className="w-5 h-5" />
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
