import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  BarChart3,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { currentUser } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'attendant']
    },
    {
      name: 'Products',
      path: '/products',
      icon: Package,
      roles: ['admin', 'attendant']
    },
    {
      name: 'Sales',
      path: '/sales',
      icon: ShoppingCart,
      roles: ['admin', 'attendant']
    },
    {
      name: 'Restock',
      path: '/restock',
      icon: TrendingUp,
      roles: ['admin']
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: BarChart3,
      roles: ['admin']
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(currentUser?.role || '')
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-colors duration-200 mt-16 transform -translate-x-full lg:translate-x-0">
      <div className="flex flex-col h-full">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;