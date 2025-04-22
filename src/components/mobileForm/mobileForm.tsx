import React, { useEffect, useRef, FormEvent } from 'react';

interface MobileFormProps {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
}

export function MobileForm({ children, className = '', onSubmit }: MobileFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Handle input focus for better mobile experience
    const handleFocus = (e: Event) => {
      const target = e.target as HTMLElement;
      // Check if the focused element is an input, select, or textarea
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA'
      ) {
        // Get viewport height and element position
        const viewportHeight = window.innerHeight;
        const rect = target.getBoundingClientRect();
        const elementBottom = rect.bottom;
        
        // If element is in the lower half of screen, scroll it into better view
        if (elementBottom > viewportHeight / 2) {
          // Add small delay to allow keyboard to appear
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    };

    // Only add listeners for mobile/touch devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && formRef.current) {
      formRef.current.addEventListener('focusin', handleFocus);
      
      return () => {
        formRef.current?.removeEventListener('focusin', handleFocus);
      };
    }
  }, []);

  return (
    <form 
      ref={formRef} 
      className={`mobile-form ${className}`}
      style={{ 
        paddingBottom: '150px', // Add extra padding at bottom for keyboard space
      }}
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
} 