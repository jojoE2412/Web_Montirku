import React from 'react';
import LoginPage from '../../components/LoginPage';

interface LoginProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose, onSwitchToSignUp }) => {
  return <LoginPage onClose={onClose} onSwitchToSignUp={onSwitchToSignUp} />;
};

export default Login;
