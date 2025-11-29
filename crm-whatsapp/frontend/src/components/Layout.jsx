import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { 
  MessageSquare, 
  Users, 
  LayoutDashboard, 
  Filter, 
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';

function Layout({ children }) {
  const { isConnected } = useSocket();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/conversations', icon: MessageSquare, label: 'Conversas' },
    { path: '/contacts', icon: Users, label: 'Contatos' },
    { path: '/funnel', icon: Filter, label: 'Funil' },
    { path: '/settings', icon: Settings, label: 'Configurações' }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-whatsapp-teal text-white flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-whatsapp-dark">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            CRM WhatsApp
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-whatsapp-dark text-white'
                        : 'text-gray-200 hover:bg-whatsapp-dark/50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Status de conexão */}
        <div className="p-4 border-t border-whatsapp-dark">
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Conectado</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-red-400">Desconectado</span>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

export default Layout;
