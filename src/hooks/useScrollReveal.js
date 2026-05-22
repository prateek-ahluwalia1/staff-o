import { useEffect } from 'react';

/**
 * Hook to handle scroll reveal animations
 * Adds the 'in' class to elements with 'reveal' class when they come into view
 */
export const useScrollReveal = () => {
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    
    // Create Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          // Optional: stop observing after element is revealed
          // observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -50px 0px' // Trigger 50px before element is fully visible
    });

    // Observe all reveal elements
    revealElements.forEach(element => {
      observer.observe(element);
    });

    return () => {
      revealElements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, []);
};

export default useScrollReveal;
