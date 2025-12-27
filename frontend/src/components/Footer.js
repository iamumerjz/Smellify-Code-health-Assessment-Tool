// components/Footer.js
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };


  return (
    <footer className="bg-white-50 border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Product Section */}
          <div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              PRODUCT
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation('/')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/plans')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              RESOURCES
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation('/contact')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Contact us
                </button>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              COMPANY
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation('/about')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              LEGAL
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation('/login')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/register')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Register
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section with Logo */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center relative" 
              style={{backgroundColor: '#5A33FF'}}
            >
              <img 
                src="/bug.png" 
                alt="Bug Icon" 
                className="w-8 h-8 object-contain"
              />
            </div>
            
            {/* Text Content */}
            <div>
              <h4 className="text-gray-900 font-semibold text-lg">Smellify</h4>
              <p className="text-gray-500 text-sm">Providing reliable tech since 2025</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}