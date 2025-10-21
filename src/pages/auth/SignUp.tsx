import React from 'react';
import SignUpPage from '../../components/SignUpPage';

interface SignUpProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onClose, onSwitchToLogin }) => {
  return <SignUpPage onClose={onClose} onSwitchToLogin={onSwitchToLogin} />;
};

export default SignUp;
