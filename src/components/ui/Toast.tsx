'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose?: () => void;
  duration?: number;
  show?: boolean;
}

export default function Toast({ 
  message, 
  type, 
  onClose, 
  duration = 5000,
  show = true 
}: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show || !mounted) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-500/20 border-green-500/30 text-green-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  };

  const toastContent = (
    <div 
      className={`fixed top-20 right-4 z-[99999] ${colors[type]} border-2 rounded-xl shadow-2xl p-5 pr-12 max-w-md backdrop-blur-md
        transition-all duration-300 ease-out pointer-events-auto min-w-[320px]`}
      style={{
        animation: show 
          ? 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
          : 'slideOutRight 0.3s ease-in forwards'
      }}
      role="alert"
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideInRight {
            from {
              transform: translateX(120%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes slideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(120%);
              opacity: 0;
            }
          }
        `
      }} />
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <p className="text-sm font-medium flex-1 leading-relaxed">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-current opacity-70 hover:opacity-100 transition-all hover:rotate-90 transform duration-200"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(toastContent, document.body);
}
