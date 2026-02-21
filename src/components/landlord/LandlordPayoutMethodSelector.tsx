import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, CreditCard, Check, Clock, DollarSign } from 'lucide-react';
import { LandlordPayoutMethodType } from '@/types/payment';
import { cn } from '@/lib/utils';

interface LandlordPayoutMethodSelectorProps {
  selectedMethod: LandlordPayoutMethodType;
  onMethodChange: (method: LandlordPayoutMethodType) => void;
}

export function LandlordPayoutMethodSelector({
  selectedMethod,
  onMethodChange
}: LandlordPayoutMethodSelectorProps) {
  const methods = [
    {
      type: 'bank_account' as LandlordPayoutMethodType,
      name: 'Bank Account',
      description: 'Standard payouts to your bank account',
      icon: Building2,
      speed: '2-7 business days',
      fee: 'Free',
      verificationTime: '1-2 days',
      recommended: true,
      features: [
        'No fees',
        'Automatic payouts',
        'Secure & reliable',
        'Best for regular income'
      ]
    },
    {
      type: 'debit_card' as LandlordPayoutMethodType,
      name: 'Debit Card',
      description: 'Instant payouts to your debit card',
      icon: CreditCard,
      speed: '~30 minutes',
      fee: '1% per payout',
      verificationTime: 'Instant',
      recommended: false,
      features: [
        'Instant access to funds',
        'No waiting period',
        'Perfect for emergencies',
        '1% fee applies'
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your Payout Method</h3>
        <p className="text-sm text-muted-foreground">
          Select how you'd like to receive rent payments from your tenants
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.type;

          return (
            <Card
              key={method.type}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary'
              )}
              onClick={() => onMethodChange(method.type)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {method.name}
                        {method.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {method.description}
                      </CardDescription>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="rounded-full bg-primary p-1">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Speed</span>
                    </div>
                    <p className="font-medium">{method.speed}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      <span>Fee</span>
                    </div>
                    <p className="font-medium">{method.fee}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Check className="h-3 w-3" />
                      <span>Setup</span>
                    </div>
                    <p className="font-medium">{method.verificationTime}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-1.5 pt-2 border-t">
                  {method.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cost Comparison Example */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">Example: $2,000 rent payment</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Bank Account</p>
                <p className="font-semibold text-green-600">$2,000.00 (no fee)</p>
                <p className="text-xs text-muted-foreground">Arrives in 2-7 days</p>
              </div>
              <div>
                <p className="text-muted-foreground">Debit Card</p>
                <p className="font-semibold">$1,980.00 ($20 fee)</p>
                <p className="text-xs text-muted-foreground">Arrives in ~30 min</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
