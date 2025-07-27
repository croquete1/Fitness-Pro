import React from 'react';

const AuthStatus: React.FC = () => {
  const isLoggedIn = false;

  return (
    <div className="p-4 bg-gray-100 rounded">
      {isLoggedIn ? 'Logged in' : 'Not logged in'}
    </div>
  );
};

export default AuthStatus;
