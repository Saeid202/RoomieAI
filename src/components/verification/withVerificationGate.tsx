import { VerificationGate } from './VerificationGate';

interface WithVerificationGateProps {
  feature?: string;
  redirectTo?: string;
}

export function withVerificationGate<P extends object>(
  Component: React.ComponentType<P>,
  options?: WithVerificationGateProps
) {
  return function VerificationProtectedComponent(props: P) {
    return (
      <VerificationGate feature={options?.feature} redirectTo={options?.redirectTo}>
        <Component {...props} />
      </VerificationGate>
    );
  };
}

// Pre-configured gates for common features
export const withRentPaymentGate = <P extends object>(Component: React.ComponentType<P>) =>
  withVerificationGate(Component, { feature: 'Rent payment' });

export const withListingPublishGate = <P extends object>(Component: React.ComponentType<P>) =>
  withVerificationGate(Component, { feature: 'Publishing listings' });

export const withPayoutGate = <P extends object>(Component: React.ComponentType<P>) =>
  withVerificationGate(Component, { feature: 'Receiving payouts' });

export const withCreditReportingGate = <P extends object>(Component: React.ComponentType<P>) =>
  withVerificationGate(Component, { feature: 'Credit reporting' });
