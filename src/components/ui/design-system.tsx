import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideIcon } from "lucide-react";

// =====================================================
// Enhanced Design System Components
// =====================================================

// Enhanced Header Component
export function EnhancedHeader({ 
  title, 
  subtitle, 
  actionButton, 
  className = "" 
}: { 
  title: string; 
  subtitle: string; 
  actionButton?: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl 
                  bg-gradient-to-r from-primary via-purple-500 to-purple-600
                  p-8 text-white shadow-xl ${className}`}
    >
      {/* Overlay for depth */}
      <div className="absolute inset-0 bg-white/5"></div>

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{title}</h1>
          <p className="text-white/90 text-lg">{subtitle}</p>
        </div>
        {actionButton}
      </div>

      {/* Decorative floating circles */}
      <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full"></div>
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full"></div>
    </div>
  );
}

// Enhanced StatCard Component
export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  className = "", 
  gradient = "from-blue-500 to-blue-600", 
  subtitle 
}: { 
  title: string; 
  value: number; 
  icon?: LucideIcon; 
  className?: string; 
  gradient?: string;
  subtitle?: string;
}) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform bg-white/90 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`bg-gradient-to-r ${gradient} p-3 rounded-xl shadow-lg`}>
            {Icon ? <Icon className="h-6 w-6 text-white" /> : null}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className={`text-3xl font-bold ${className}`}>{value}</div>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000`} style={{ width: `${Math.min((value / Math.max(value, 1)) * 100, 100)}%` }}></div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Search Component
export function EnhancedSearch({ 
  placeholder, 
  value, 
  onChange, 
  className = "" 
}: { 
  placeholder: string; 
  value: string; 
  onChange: (value: string) => void; 
  className?: string; 
}) {
  return (
    <div className={`relative group ${className}`}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300"
      />
    </div>
  );
}

// Enhanced Filter Component
export function EnhancedFilter({ 
  value, 
  onValueChange, 
  options, 
  placeholder = "Filter by..." 
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Enhanced Card Component
export function EnhancedCard({ 
  children, 
  className = "", 
  hover = true 
}: { 
  children: React.ReactNode; 
  className?: string; 
  hover?: boolean; 
}) {
  return (
    <Card className={`border-0 shadow-xl bg-white/80 backdrop-blur-sm ${hover ? 'hover:shadow-2xl transition-all duration-300 hover:scale-105 transform' : ''} ${className}`}>
      {children}
    </Card>
  );
}

// Enhanced Button Component
export function EnhancedButton({ 
  children, 
  variant = "default", 
  size = "default", 
  className = "", 
  ...props 
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  [key: string]: any;
}) {
  const baseClasses = "transition-all duration-300 transform hover:scale-105";
  const variantClasses = {
    default: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30",
    outline: "border-2 border-blue-500 text-blue-600 hover:bg-blue-50",
    ghost: "hover:bg-gray-100",
    link: "text-blue-600 hover:underline",
    destructive: "bg-red-500 hover:bg-red-600 text-white"
  };

  return (
    <Button 
      variant={variant}
      size={size}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}

// Enhanced Tabs Component
export function EnhancedTabs({ 
  value, 
  onValueChange, 
  children, 
  className = "" 
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={`space-y-6 ${className}`}>
      {children}
    </Tabs>
  );
}

// Enhanced TabsList Component
export function EnhancedTabsList({ 
  children, 
  className = "" 
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex justify-center">
      <TabsList className={`grid w-full max-w-md grid-cols-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-1 ${className}`}>
        {children}
      </TabsList>
    </div>
  );
}

// Enhanced TabsTrigger Component
export function EnhancedTabsTrigger({ 
  value, 
  children, 
  className = "" 
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsTrigger 
      value={value}
      className={`rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300 ${className}`}
    >
      {children}
    </TabsTrigger>
  );
}

// Enhanced Section Header Component
export function EnhancedSectionHeader({ 
  icon: Icon, 
  title, 
  description, 
  className = "" 
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-4 mb-6 ${className}`}>
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        {description && <p className="text-gray-600">{description}</p>}
      </div>
    </div>
  );
}

// Enhanced Form Field Component
export function EnhancedFormField({ 
  label, 
  children, 
  required = false, 
  className = "" 
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

// Enhanced Input Component
export function EnhancedInput({ 
  className = "", 
  ...props 
}: {
  className?: string;
  [key: string]: any;
}) {
  return (
    <Input 
      className={`h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300 ${className}`}
      {...props}
    />
  );
}

// Enhanced Textarea Component
export function EnhancedTextarea({ 
  className = "", 
  ...props 
}: {
  className?: string;
  [key: string]: any;
}) {
  return (
    <textarea 
      className={`w-full h-24 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300 p-3 resize-none ${className}`}
      {...props}
    />
  );
}

// Enhanced Select Component
export function EnhancedSelect({ 
  value, 
  onValueChange, 
  options, 
  placeholder = "Select...", 
  className = "" 
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300 ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Enhanced Status Badge Component
export function EnhancedStatusBadge({ 
  status, 
  className = "" 
}: {
  status: string;
  className?: string;
}) {
  const statusMap: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' },
    under_review: { label: 'Under Review', cls: 'bg-blue-100 text-blue-800' },
    approved: { label: 'Approved', cls: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800' },
    withdrawn: { label: 'Withdrawn', cls: 'bg-gray-100 text-gray-800' },
    active: { label: 'Active', cls: 'bg-green-100 text-green-800' },
    inactive: { label: 'Inactive', cls: 'bg-gray-100 text-gray-800' },
    completed: { label: 'Completed', cls: 'bg-blue-100 text-blue-800' },
  };

  const statusInfo = statusMap[status] || statusMap.pending;
  
  return (
    <Badge className={`${statusInfo.cls} ${className}`}>
      {statusInfo.label}
    </Badge>
  );
}

// Enhanced Empty State Component
export function EnhancedEmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className = "" 
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`border-0 shadow-xl bg-white/80 backdrop-blur-sm ${className}`}>
      <CardContent className="py-16 text-center">
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-lg text-gray-600 mb-6">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}

// Enhanced Page Layout Component
export function EnhancedPageLayout({ 
  children, 
  className = "" 
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 ${className}`}>
      <div className="space-y-8 p-6">
        {children}
      </div>
    </div>
  );
}
