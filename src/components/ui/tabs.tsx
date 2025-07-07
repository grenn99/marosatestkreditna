import React from 'react';

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
}) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleTabChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setActiveTab(newValue);
    }
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === TabsList) {
            return React.cloneElement(child, {
              activeTab,
              onTabChange: handleTabChange,
            });
          }
          if (child.type === TabsContent) {
            return React.cloneElement(child, {
              activeTab,
            });
          }
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export const TabsList: React.FC<TabsListProps> = ({
  className,
  children,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TabsTrigger) {
          return React.cloneElement(child, {
            active: activeTab === child.props.value,
            onClick: () => onTabChange && onTabChange(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  className,
  children,
  active,
  onClick,
}) => {
  return (
    <button
      type="button"
      className={`${className} ${active ? 'bg-white shadow-sm' : ''}`}
      onClick={onClick}
      data-state={active ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  activeTab?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  className,
  children,
  activeTab,
}) => {
  if (activeTab !== value) {
    return null;
  }

  return (
    <div className={className} data-state={activeTab === value ? 'active' : 'inactive'}>
      {children}
    </div>
  );
};
