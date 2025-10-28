# 🎯 GSAP Animation Quick Reference

## 🚀 Quick Start

### 1. Import GSAP
```tsx
'use client' // Next.js 13+ only

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}
```

### 2. Basic Animation
```tsx
useEffect(() => {
  gsap.from('.element', {
    opacity: 0,
    y: 50,
    duration: 1
  })
}, [])
```

---

## 📦 Animation Utilities

### Import
```tsx
import { AnimationUtils } from '@/lib/animations/gsap-utils'
```

### Methods

| Method | Usage | Options |
|--------|-------|---------|
| **fadeInUp** | `AnimationUtils.fadeInUp('.hero')` | duration, delay, y |
| **staggerIn** | `AnimationUtils.staggerIn('.cards')` | stagger, duration |
| **parallax** | `AnimationUtils.parallax('.bg', { speed: 0.5 })` | speed, scrollTrigger |
| **magneticButton** | `AnimationUtils.magneticButton('.btn')` | strength, distance |
| **counterAnimation** | `AnimationUtils.counterAnimation('.count')` | target, duration |

---

## 🎨 Animated Buttons

### Import
```tsx
import { 
  AnimatedButton,
  PulsingButton,
  GlowingButton,
  ShimmerButton 
} from '@/components/ui/animated-button'
```

### Basic Usage
```tsx
<AnimatedButton variant="gradient" size="lg" magnetic ripple>
  Click Me
</AnimatedButton>
```

### Props
```tsx
variant?: 'default' | 'outline' | 'ghost' | 'gradient'
size?: 'sm' | 'md' | 'lg'
magnetic?: boolean  // Default: true
ripple?: boolean    // Default: true
```

---

## 📜 Common Patterns

### Hero Animation
```tsx
gsap.from('.hero-title', {
  opacity: 0,
  y: 100,
  duration: 1.2,
  ease: 'power4.out'
})
```

### Scroll-Triggered Cards
```tsx
gsap.from('.card', {
  opacity: 0,
  y: 80,
  stagger: 0.2,
  scrollTrigger: {
    trigger: '.card',
    start: 'top 80%'
  }
})
```

### Parallax Background
```tsx
gsap.to('.parallax-bg', {
  yPercent: 30,
  scrollTrigger: {
    trigger: '.section',
    scrub: true
  }
})
```

### Counter Animation
```tsx
gsap.to('.counter', {
  textContent: 1000,
  duration: 2,
  snap: { textContent: 1 }
})
```

---

## 🎭 CSS Animations

### Usage
```tsx
<div className="animate-fade-in-up">Content</div>
```

### Available Classes
- `animate-ripple` - Button click ripple
- `animate-shimmer` - Shine effect
- `animate-pulse-glow` - Glowing pulse
- `animate-float` - Floating motion
- `animate-gradient` - Gradient shift
- `animate-bounce-in` - Bouncy entrance

---

## ⚡ Performance Tips

1. **Use `will-change`**
   ```css
   .animated { will-change: transform, opacity; }
   ```

2. **Cleanup animations**
   ```tsx
   useEffect(() => {
     const ctx = gsap.context(() => {
       // animations
     })
     return () => ctx.revert() // IMPORTANT
   }, [])
   ```

3. **Hardware acceleration**
   ```tsx
   gsap.set('.element', { force3D: true })
   ```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Animation not working | Check `gsap.registerPlugin()` |
| ScrollTrigger not firing | Add `ScrollTrigger.refresh()` |
| Performance lag | Reduce animated elements |
| Memory leak | Use `ctx.revert()` in cleanup |

---

## 📝 Easing Functions

```tsx
ease: 'power1.out'   // Smooth deceleration
ease: 'power4.out'   // Strong deceleration
ease: 'back.out'     // Overshoot effect
ease: 'elastic.out'  // Bouncy effect
ease: 'sine.inOut'   // Smooth both ends
```

[Visualize: greensock.com/ease-visualizer](https://greensock.com/ease-visualizer/)

---

## 🎯 ScrollTrigger Options

```tsx
scrollTrigger: {
  trigger: '.element',        // Element to watch
  start: 'top 80%',          // When to start
  end: 'bottom 20%',         // When to end
  scrub: true,               // Smooth scroll
  markers: true,             // Debug markers
  toggleActions: 'play none none reverse'
}
```

---

## 📚 Resources

- [GSAP Docs](https://greensock.com/docs/)
- [ScrollTrigger Docs](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [Showcase Page](/showcase) - Live demos
- [Full Docs](/ANIMATION_IMPLEMENTATION.md)

---

## 🎨 Demo Pages

1. **`/landing-enhanced`** - Full parallax landing page
2. **`/showcase`** - Interactive animation demos

---

**Quick Start:** Copy examples above and modify to your needs!
