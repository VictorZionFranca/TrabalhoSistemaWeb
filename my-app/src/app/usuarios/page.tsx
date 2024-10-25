// src/app/usuarios/page.tsx
import React from 'react';

const Usuarios: React.FC = () => {
  // Simulando uma lista de usuários
  const usuarios = [
    { id: 1, nome: 'João Silva', email: 'joao.silva@example.com' },
    { id: 2, nome: 'Maria Oliveira', email: 'maria.oliveira@example.com' },
    { id: 3, nome: 'Carlos Souza', email: 'carlos.souza@example.com' },
  ];

  return (
    <main className="container">
      <h2>Lista de Usuários</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.nome}</td>
              <td>{usuario.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
};

export default Usuarios;
