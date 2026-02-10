import React from 'react';
import { VerificationGate } from './VerificationGate';

interface PaymentVerificationWrapperProps {
  children: React.ReactNode;
}

export function PaymentVerificationWrapper({ children }: PaymentVerificationWrapperProps) {
  return (
    <VerificationGate feature="Rent payment">
      {children}
    </VerificationGate>
  );
}
