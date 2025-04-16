import { useEffect, useState } from 'react';
import { Toaster, ToasterProps } from 'sonner';
import { createPortal } from 'react-dom';

/**
 * A wrapper around sonner's Toaster that ensures toast notifications
 * are rendered directly into the document body, outside any stacking contexts.
 */
export function CustomToaster(props: ToasterProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create a dedicated container for toasts
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '0';
    toastContainer.style.left = '0';
    toastContainer.style.right = '0';
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
      className={`pointer-events-auto ${props.className || ''}`}
      toastOptions={{
        ...props.toastOptions,
        style: {
          zIndex: 2147483647,
          pointerEvents: 'auto',
          ...props.toastOptions?.style,
        },
      }}
    />,
    portalContainer
  );
} 