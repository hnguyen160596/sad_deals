import React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    // Prevent body scrolling when dialog is open
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
      <div className="fixed inset-0 -z-10" onClick={() => onOpenChange(false)}></div>
    </div>
  );
};

export const DialogContent: React.FC<{ children: React.ReactNode, className?: string }> = ({
  children,
  className = ""
}) => {
  return (
    <div className={`relative w-full max-w-lg mx-auto rounded-lg ${className}`}>
      {children}
    </div>
  );
};
