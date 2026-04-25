# 🚀 TubesBackground - Quick Reference Card

## ⚡ Instant Setup (Copy & Paste)

```tsx
"use client";
import TubesBackground from '@/components/TubesBackground';

export default function Page() {
  return (
    <TubesBackground className="w-full h-screen">
      <div className="flex items-center justify-center h-full">
        <h1 className="text-white text-6xl font-bold">Your Content Here</h1>
      </div>
    </TubesBackground>
  );
}
```

---

## 🎨 Color Schemes (Copy & Use)

### 1️⃣ Cool Blue (Default)
```tsx
<TubesBackground
  colors={["#63b3ed", "#9f7aea", "#4fd1c5"]}
  lightColors={["#63b3ed", "#9f7aea", "#4fd1c5", "#f687b3"]}
>
```

### 2️⃣ Vibrant Purple
```tsx
<TubesBackground
  colors={["#f967fb", "#53bc28", "#6958d5"]}
  lightColors={["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"]}
>
```

### 3️⃣ Neon Cyan
```tsx
<TubesBackground
  colors={["#00ff88", "#0fffff", "#00d4ff"]}
  lightColors={["#00ff88", "#0fffff", "#00d4ff", "#64ffda"]}
>
```

### 4️⃣ Electric Pink
```tsx
<TubesBackground
  colors={["#ff0080", "#ff6b9d", "#ff1493"]}
  lightColors={["#ff0080", "#ff1493", "#ffb6c1", "#ff69b4"]}
>
```

### 5️⃣ Forest Green
```tsx
<TubesBackground
  colors={["#00cc88", "#22ffcc", "#11dd77"]}
  lightColors={["#00cc88", "#22ffcc", "#11dd77", "#00ff99"]}
>
```

---

## 🎯 Common Tasks

### Task: Navigate on Button Click
```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();
<button onClick={() => router.push('/dashboard')}>
  Go to Dashboard
</button>
```

### Task: Custom Click Handler
```tsx
<TubesBackground 
  onClick={() => {
    console.log('User clicked the background!');
    // Your logic here
  }}
>
```

### Task: Disable Color Randomization
```tsx
<TubesBackground enableClickInteraction={false}>
```

### Task: Auto-Navigate After Delay
```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    router.push('/next-page');
  }, 3000); // 3 seconds
  
  return () => clearTimeout(timer);
}, [router]);
```

### Task: Add Loading Spinner
```tsx
<TubesBackground>
  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity }}>
    <Loader className="w-12 h-12 text-white" />
  </motion.div>
</TubesBackground>
```

---

## 📱 Layout Patterns

### Full Screen
```tsx
<TubesBackground className="w-full h-screen">
  {/* content */}
</TubesBackground>
```

### Half Screen + Below
```tsx
<>
  <TubesBackground className="w-full h-1/2">
    {/* hero section */}
  </TubesBackground>
  <div className="w-full h-1/2 bg-slate-950">
    {/* other content */}
  </div>
</>
```

### Hero Section
```tsx
<TubesBackground className="w-full h-96">
  {/* short hero */}
</TubesBackground>
<div className="w-full bg-slate-950">
  {/* main content */}
</div>
```

---

## 🔤 Typography + Tubes

### Large Heading
```tsx
<h1 className="text-8xl font-black text-white drop-shadow-lg">
  Title
</h1>
```

### With Subtitle
```tsx
<div>
  <h1 className="text-8xl font-black text-white mb-2">Main Title</h1>
  <p className="text-2xl text-white/60 mb-8">Subtitle here</p>
</div>
```

### With Tagline
```tsx
<div>
  <p className="text-xs tracking-[0.3em] uppercase text-white/60">
    TAGLINE
  </p>
  <h1 className="text-8xl font-black text-white">Title</h1>
</div>
```

---

## 🔘 Button Styles + Tubes

### Primary Button
```tsx
<button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all">
  Button Text
</button>
```

### Secondary Button
```tsx
<button className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full font-bold transition-all">
  Button Text
</button>
```

### Animated Button
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold"
>
  Click Me
</motion.button>
```

---

## 🎬 Animation Patterns

### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
```

### Scale In
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
>
```

### Slide Up
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
```

### Staggered Children
```tsx
<motion.div>
  {items.map((item, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: i * 0.1 }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

## 🎯 Complete Page Example

```tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import TubesBackground from '@/components/TubesBackground';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  return (
    <TubesBackground className="w-full h-screen">
      <div className="flex items-center justify-center h-full">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <h1 className="text-8xl font-black text-white mb-4">Welcome</h1>
              <p className="text-white/60 mb-8 text-lg">Ready to get started?</p>
              <button
                onClick={() => setStep(1)}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold flex items-center gap-2 mx-auto"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <h2 className="text-6xl font-bold text-white mb-8">Almost there...</h2>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-full font-bold flex items-center gap-2 mx-auto"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TubesBackground>
  );
}
```

---

## 📚 File Locations

| Component | Path |
|-----------|------|
| Main | `@/components/TubesBackground.tsx` |
| Modal | `@/components/TubesWelcomeOverlay.tsx` |
| Home Page | `@/app/page.tsx` |
| Splash Example | `@/app/intro/page.tsx` |

---

## 🔍 Props Reference

| Prop | Type | Default | Use |
|------|------|---------|-----|
| `children` | `ReactNode` | - | Content to display |
| `className` | `string` | - | CSS classes |
| `colors` | `string[]` | Blue theme | Tube colors |
| `lightColors` | `string[]` | Blue theme | Light colors |
| `enableClickInteraction` | `boolean` | `true` | Click to change colors |
| `onClick` | `() => void` | - | Custom click handler |

---

## ✅ Performance Tips

✅ Use `h-screen` for full height
✅ Use `h-96` for partial sections
✅ Wrap heavy content in `useMemo`
✅ Use `"use client"` directive
✅ Disable click interaction if not needed
✅ Test on mobile devices

❌ Don't use `h-auto` on full-screen versions
❌ Don't nest multiple TubesBackground components
❌ Don't add heavy animations inside
❌ Don't forget the directive `"use client"`

---

## 🆘 Quick Fixes

**Canvas not showing?**
→ Add `className="w-full h-screen"`

**Content not clickable?**
→ Ensure parent has `pointer-events-auto`

**Looking blurry?**
→ Check browser zoom (should be 100%)

**Slow performance?**
→ Disable `enableClickInteraction={false}`

**Colors not changing?**
→ Ensure `enableClickInteraction={true}`

---

**More help?** See [TUBES_INTEGRATION_GUIDE.md](TUBES_INTEGRATION_GUIDE.md)
