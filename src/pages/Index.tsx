
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Rediriger vers le tableau de bord
    navigate('/dashboard');
  }, [navigate]);
  
  return null;
};

export default Index;
