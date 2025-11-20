interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  href, 
  onClick, 
  className = '' 
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-full transition-all duration-300 inline-flex items-center justify-center space-x-3 transform hover:scale-105';
  
  const variantClasses = {
    primary: 'bg-brand-blue hover:bg-blue-600 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-brand-blue hover:bg-blue-600 text-white'
  };

  const sizeClasses = {
    sm: 'px-6 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-10 py-4 text-lg'
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={buttonClasses}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={buttonClasses}>
      {children}
    </button>
  );
}

// Export specific CTA button for hero section with exact styling
export function CTAButton() {
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '1s' }}>
      <Button variant="primary" size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-5 text-xl font-bold shadow-2xl hover:shadow-blue-500/25">
        <span>Shop Now</span>
        <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Button>
    </div>
  );
}