import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

import { useLanguage } from '../LanguageContext';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { language } = useLanguage();

  return (
    <div className="relative z-10"> {/* Full width */}
      <div className="p-2 sm:p-4 lg:p-8"> {/* Reduced padding on mobile */}
        {children}
      </div>
    </div>
  );
};

export default Layout;