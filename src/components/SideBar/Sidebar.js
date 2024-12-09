import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: <i className="fa-solid fa-chart-column icon-custom-color"></i>,
      path: '/dashboard'
    },
    {
      icon: <i className="fa-solid fa-bars icon-custom-color"></i>,
      path: '/events'
    },
    {
      icon: <i className="fa-solid fa-pen-to-square icon-custom-color"></i>,
      path: '/forms'
    }
  ];

  return (
    <div className="sidebar">
      {menuItems.map((item, index) => (
        <div
          key={index}
          className="menu-item"
          onClick={() => navigate(item.path)}
        >
          {/* Renderizando o ícone diretamente */}
          {item.icon}
        </div>
      ))}
    </div>
  );
}

export default Sidebar;
