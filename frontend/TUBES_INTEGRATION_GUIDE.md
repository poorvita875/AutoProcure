# TubesBackground Component Integration Guide

## ✨ Overview
The `TubesBackground` component is a high-performance, interactive 3D neon tube background component that follows your cursor and responds to clicks. It's now integrated into your application and ready to use across all pages.

## 📦 Component Location
- **Path**: `@/components/TubesBackground.tsx`
- **Already Installed**: `three@^0.184.0`, `framer-motion@^12.38.0`

## 🚀 Quick Start

### Basic Usage
```tsx
import TubesBackground from '@/components/TubesBackground';

export default function Page() {
  return (
    <TubesBackground className="w-full h-screen">
      {/* Your content here */}
      <div className="flex items-center justify-center h-full">
        <h1>Welcome</h1>
      </div>
    </TubesBackground>
  );
}
```

## 🎨 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | `undefined` | Content to overlay on the canvas |
| `className` | `string` | `undefined` | Additional CSS classes |
| `colors` | `string[]` | `["#63b3ed", "#9f7aea", "#4fd1c5"]` | Tube colors (hex) |
| `lightColors` | `string[]` | `["#63b3ed", "#9f7aea", "#4fd1c5", "#f687b3"]` | Light colors (hex) |
| `enableClickInteraction` | `boolean` | `true` | Click to randomize colors |
| `onClick` | `() => void` | `undefined` | Custom click handler |

## 💡 Usage Examples

### Example 1: Landing Page (Current Implementation)
```tsx
import TubesBackground from '@/components/TubesBackground';

export default function Home() {
  const router = useRouter();

  return (
    <TubesBackground 
      className="w-full h-screen"
      colors={["#63b3ed", "#9f7aea", "#4fd1c5"]}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-6xl font-bold text-white">Welcome to SupplyMind</h1>
        <button onClick={() => router.push('/dashboard')}>
          Enter Dashboard
        </button>
      </div>
    </TubesBackground>
  );
}
```

### Example 2: Splash Screen
```tsx
import TubesBackground from '@/components/TubesBackground';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000); // Auto-navigate after 5 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <TubesBackground className="w-full h-screen">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-8xl font-black text-white mb-4">AUTOPROCURE</h1>
          <p className="text-xl text-white/60">AI-Powered Procurement Platform</p>
        </div>
      </div>
    </TubesBackground>
  );
}
```

### Example 3: Custom Colors
```tsx
// Red/Pink theme
<TubesBackground 
  colors={["#ff0080", "#ff6b9d", "#ff1493"]}
  lightColors={["#ff0080", "#ff1493", "#ffb6c1", "#ff69b4"]}
>
  {/* content */}
</TubesBackground>

// Green/Cyan theme
<TubesBackground 
  colors={["#00ff88", "#0fffff", "#00d4ff"]}
  lightColors={["#00ff88", "#0fffff", "#00d4ff", "#64ffda"]}
>
  {/* content */}
</TubesBackground>
```

### Example 4: With Custom Click Handler
```tsx
<TubesBackground 
  onClick={() => {
    console.log('Tubes clicked!');
    // Your custom logic
  }}
>
  {/* content */}
</TubesBackground>
```

## 🔄 Navigation Flow

Your current setup supports this flow:

```
Home (Landing Page)
  ├─ GET STARTED → Sign Up Form → Dashboard
  └─ LOG IN → Login Form → Dashboard
```

To navigate between pages, use Next.js `useRouter`:
```tsx
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const router = useRouter();

  return (
    <button onClick={() => router.push('/dashboard')}>
      Go to Dashboard
    </button>
  );
}
```

## 🎯 Best Practices

1. **Always use "use client" directive**
   ```tsx
   "use client";
   import TubesBackground from '@/components/TubesBackground';
   ```

2. **Set appropriate container height**
   ```tsx
   <TubesBackground className="w-full h-screen"> {/* or min-h-screen */}
   ```

3. **Center content properly**
   ```tsx
   <div className="flex items-center justify-center h-full">
     {/* Content will be centered */}
   </div>
   ```

4. **Handle pointerEvents for interactive content**
   - Content inside TubesBackground is automatically given `pointer-events-auto`
   - Buttons and forms will work as expected

## 🎬 Current Implementation Status

✅ **Completed:**
- TubesBackground component created and optimized
- Integrated into Home page (`/app/page.tsx`)
- Responsive design with mobile support
- Click interaction for color randomization
- Proper navigation to dashboard

## 🔗 File References

- **Component**: [TubesBackground.tsx](components/TubesBackground.tsx)
- **Home Page**: [app/page.tsx](app/page.tsx)
- **Utilities**: [lib/utils.ts](lib/utils.ts)

## 📝 Next Steps

1. **Create a dedicated splash/intro page** if needed:
   ```
   /app/intro/page.tsx
   ```

2. **Use on other pages** - Apply to login, signup, or welcome screens

3. **Customize colors** - Adjust `colors` and `lightColors` props to match your brand

4. **Add animations** - Combine with Framer Motion for additional effects

## ⚙️ Performance Tips

- The canvas uses WebGL for high performance
- Loading is asynchronous (no blocking)
- Responsive to container size automatically
- Memory efficiently cleaned up on unmount

## 🐛 Troubleshooting

**Issue**: Canvas not showing
- Ensure parent has explicit `height` (use `h-screen` or similar)
- Check browser console for errors
- Verify JavaScript is enabled

**Issue**: Content not interactive
- Wrap interactive elements in div with `pointer-events-auto`
- TubesBackground automatically enables this for children

**Issue**: Colors not changing on click
- Check `enableClickInteraction` prop (default is `true`)
- Verify click is not being prevented by `onClick` handlers

## 📚 Resources

- [Three.js Docs](https://threejs.org/docs/)
- [Framer Motion](https://www.framer.com/motion/)
- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)
