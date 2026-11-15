import React from 'react';
import { FarmerVoiceRegistration } from './FarmerVoiceRegistration';

// RegisterPage is exclusively the voice-first Farmer Registration experience.
// No Officer or NASA Admin roles, and no traditional manual forms.
export const RegisterPage: React.FC = () => {
  return <FarmerVoiceRegistration />;
};
