/**
 * GSAP Animation Utilities
 * Centralized animation configurations and helpers
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/dist/ScrollToPlugin';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

export class AnimationUtils {
  /**
   * Fade in animation with scale
   */
  static fadeInUp(element: HTMLElement | string, options = {}) {
    return gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 60,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'power3.out',
        ...options,
      }
    );
  }

  /**
   * Stagger animation for multiple elements
   */
  static staggerIn(elements: HTMLElement[] | string, options = {}) {
    return gsap.fromTo(
      elements,
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.1,
        ...options,
      }
    );
  }

  /**
   * Parallax scroll effect
   */
  static parallax(element: HTMLElement | string, speed = 0.5) {
    gsap.to(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
      y: () => window.innerHeight * speed,
      ease: 'none',
    });
  }

  /**
   * Text reveal animation
   */
  static textReveal(element: HTMLElement | string, options = {}) {
    return gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 100,
        rotationX: -90,
      },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.05,
        ...options,
      }
    );
  }

  /**
   * Scroll-triggered animation
   */
  static scrollTriggerAnimation(
    element: HTMLElement | string,
    animationProps: gsap.TweenVars,
    triggerOptions = {}
  ) {
    return gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        ...triggerOptions,
      },
      ...animationProps,
    });
  }

  /**
   * Magnetic button effect
   */
  static magneticButton(button: HTMLElement) {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(button, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }

  /**
   * Smooth scroll to element
   */
  static smoothScrollTo(target: string | number, options = {}) {
    gsap.to(window, {
      scrollTo: target,
      duration: 1.5,
      ease: 'power3.inOut',
      ...options,
    });
  }

  /**
   * Page transition animation
   */
  static pageTransition(onComplete?: () => void) {
    const tl = gsap.timeline({
      onComplete,
    });

    tl.to('.page-transition', {
      scaleY: 1,
      duration: 0.6,
      ease: 'power4.inOut',
      transformOrigin: 'bottom',
    }).to('.page-transition', {
      scaleY: 0,
      duration: 0.6,
      ease: 'power4.inOut',
      transformOrigin: 'top',
      delay: 0.2,
    });

    return tl;
  }

  /**
   * Hover scale animation
   */
  static hoverScale(element: HTMLElement | string, scale = 1.05) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;

    el.addEventListener('mouseenter', () => {
      gsap.to(el, {
        scale,
        duration: 0.3,
        ease: 'power2.out',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  }

  /**
   * Counter animation
   */
  static counterAnimation(
    element: HTMLElement | string,
    endValue: number,
    options = {}
  ) {
    const obj = { value: 0 };

    return gsap.to(obj, {
      value: endValue,
      duration: 2,
      ease: 'power1.out',
      onUpdate: () => {
        const el =
          typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
          el.textContent = Math.round(obj.value).toString();
        }
      },
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
      },
      ...options,
    });
  }

  /**
   * Cleanup all ScrollTrigger instances
   */
  static cleanup() {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}

export default AnimationUtils;
