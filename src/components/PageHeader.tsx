import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <div className="bg-brown-800 text-white py-8 px-4">
      <div className="container mx-auto">
        <div className="flex items-center mb-2">
          {icon && <span className="mr-3">{icon}</span>}
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        {subtitle && <p className="text-lg text-amber-200">{subtitle}</p>}
      </div>
    </div>
  );
}
