import { useEffect, useState } from 'react';
import { Toaster, ToasterProps } from 'sonner';
import { createPortal } from 'react-dom';

/**
 * A wrapper around sonner's Toaster that ensures toast notifications
 * are rendered directly into the document body, outside any stacking contexts.
 * Positioned to avoid covering the back button on mobile devices.
 */
export function CustomToaster(props: ToasterProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create a dedicated container for toasts
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '0';
    
    // Instead of covering the full width, set right-aligned positioning
    // This leaves space for the back button on the left
    toastContainer.style.right = '0';
    // Only take up 70% of the screen width (leaves space for back button)
    toastContainer.style.maxWidth = '70%';
    
    toastContainer.style.zIndex = '2147483647'; // Maximum possible z-index
    toastContainer.style.pointerEvents = 'none'; // Allow clicking through the container
    
    // The actual toasts will have pointer events enabled individually
    document.body.appendChild(toastContainer);
    
    setPortalContainer(toastContainer);
    
    return () => {
      document.body.removeChild(toastContainer);
    };
  }, []);

  if (!portalContainer) {
    return null;
  }

  return createPortal(
    <Toaster
      {...props}
      position="top-right" // Force top-right positioning
      className={`pointer-events-auto ${props.className || ''}`}
      toastOptions={{
        ...props.toastOptions,
        style: {
          zIndex: 2147483647,
          pointerEvents: 'auto',
          maxWidth: '100%', // Toast width constrained by container
          ...props.toastOptions?.style,
        },
      }}
    />,
    portalContainer
  );
} 