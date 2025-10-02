import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { transitionFeedback, completionFeedback, settleFeedback } from '@/utils/feedbackUtils';

interface TransitionData {
  agendamento: any;
  modalElement: HTMLElement;
  targetPosition: { x: number; y: number };
  employeeColor: string;
  onComplete: () => void;
}

interface ModalToCardTransitionProps {
  isActive: boolean;
  transitionData?: TransitionData;
}

export function ModalToCardTransition({ 
  isActive, 
  transitionData 
}: ModalToCardTransitionProps) {
  const [animationPhase, setAnimationPhase] = useState<string>('idle');
  const [squareElement, setSquareElement] = useState<HTMLElement | null>(null);
  const animationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !transitionData) return;
    startTransition();
  }, [isActive, transitionData]);

  const startTransition = () => {
    if (!transitionData) return;
    const { modalElement, targetPosition, employeeColor, onComplete } = transitionData;

    setAnimationPhase('transitioning');

    // Immediate modal fade out - don't block user
    modalElement.style.transition = 'all 200ms ease-out';
    modalElement.style.opacity = '0';
    modalElement.style.transform = 'scale(0.95)';

    // Close modal immediately, show notification in background
    setTimeout(() => {
      setAnimationPhase('idle');
      onComplete(); // Close modal right away
    }, 50); // Almost immediate

    // Show success notification independently (non-blocking)
    setTimeout(() => {
      createSimpleSuccessIndicator(targetPosition, employeeColor);
    }, 100);
  };

  const createSimpleSuccessIndicator = (targetPosition: { x: number; y: number }, employeeColor: string) => {
    // Find the aguardando container to show a simple success state
    const aguardandoContainer = document.querySelector('[data-appointments-container="aguardando-confirmacao"]');
    if (aguardandoContainer) {
      // Create a simple notification that slides in
      const notification = document.createElement('div');
      notification.style.position = 'fixed';
      notification.style.top = '20px';
      notification.style.right = '20px';
      notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      notification.style.color = 'white';
      notification.style.padding = '12px 16px';
      notification.style.borderRadius = '8px';
      notification.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
      notification.style.fontSize = '14px';
      notification.style.fontWeight = '500';
      notification.style.zIndex = '1000';
      notification.style.transform = 'translateX(100%)';
      notification.style.transition = 'all 300ms ease-out';
      notification.style.pointerEvents = 'none'; // Non-obstructive
      notification.innerHTML = '✓ Agendamento criado com sucesso!';

      document.body.appendChild(notification);

      // Slide in
      setTimeout(() => {
        notification.style.transform = 'translateX(0%)';
      }, 50);

      // Fade out and remove - shorter time, less intrusive
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 200);
      }, 1500); // Reduced from 2000ms to 1500ms
    }

    // Simple completion feedback
    completionFeedback({ volume: 0.2 });
  };





  if (!isActive) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <div 
        ref={animationRef}
        className="relative w-full h-full"
        data-animation-phase={animationPhase}
      />
    </div>,
    document.body
  );
}

export function useModalToCardTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionData, setTransitionData] = useState<TransitionData | undefined>();

  const startTransition = (data: Omit<TransitionData, 'onComplete'>) => {
    console.log('🎮 useModalToCardTransition.startTransition chamado:', data);
    setTransitionData({
      ...data,
      onComplete: () => {
        console.log('🏁 Animação completada');
        setIsTransitioning(false);
        setTransitionData(undefined);
      }
    });
    setIsTransitioning(true);
    console.log('✅ Estados atualizados - isTransitioning:', true);
  };

  return {
    isTransitioning,
    transitionData,
    startTransition,
    TransitionComponent: () => (
      <ModalToCardTransition 
        isActive={isTransitioning} 
        transitionData={transitionData} 
      />
    )
  };
}
