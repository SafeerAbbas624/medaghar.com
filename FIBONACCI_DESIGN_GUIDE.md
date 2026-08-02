# Fibonacci Sequence in Web Design

## The Golden Ratio (φ = 1.618)
The Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...) creates the Golden Ratio when dividing consecutive numbers.

## Application in Zameen.pk Design

### Typography Scale (Fibonacci-based)
Using base 16px:
- **13px** - Small text, captions
- **16px** - Body text (base)
- **21px** - Large body, small headings
- **26px** - H4 headings
- **34px** - H3 headings
- **42px** - H2 headings
- **55px** - H1 headings
- **68px** - Hero headings
- **89px** - Extra large hero

### Spacing Scale (Fibonacci in pixels)
- **3px** - Tiny gaps
- **5px** - Small gaps
- **8px** - Standard small spacing
- **13px** - Medium spacing
- **21px** - Large spacing
- **34px** - Extra large spacing
- **55px** - Section spacing
- **89px** - Major section spacing

### Layout Proportions
- **Content width**: 1440px (89 × 16.18)
- **Sidebar ratio**: 1:1.618 (38.2% sidebar, 61.8% content)
- **Hero section height**: 610px (377 × 1.618)
- **Card aspect ratio**: 1:1.618 (width:height)

### Grid System
- **2-column**: 1:1.618 ratio (38.2% / 61.8%)
- **3-column**: Equal thirds with 1.618 gaps
- **Feature sections**: 5:8 ratio

### Color Harmony
Using Golden Ratio for color distribution:
- **Primary color**: 61.8% of design
- **Secondary color**: 38.2% of design
- **Accent color**: 23.6% of design

### Component Sizing
- **Buttons**: Height 55px, padding 21px × 34px
- **Input fields**: Height 55px
- **Cards**: Width 377px, Height 610px (1:1.618)
- **Icons**: 21px, 34px, 55px sizes
- **Avatars**: 34px, 55px, 89px sizes

### Image Dimensions
- **Hero images**: 1440 × 890px
- **Property cards**: 377 × 233px
- **Thumbnails**: 144 × 89px
- **Feature images**: 610 × 377px

## Tailwind CSS Custom Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        '3': '3px',
        '5': '5px',
        '8': '8px',
        '13': '13px',
        '21': '21px',
        '34': '34px',
        '55': '55px',
        '89': '89px',
        '144': '144px',
        '233': '233px',
        '377': '377px',
        '610': '610px',
      },
      fontSize: {
        'fib-xs': '13px',
        'fib-sm': '16px',
        'fib-base': '21px',
        'fib-lg': '26px',
        'fib-xl': '34px',
        'fib-2xl': '42px',
        'fib-3xl': '55px',
        'fib-4xl': '68px',
        'fib-5xl': '89px',
      },
    },
  },
}
```

## Visual Hierarchy
1. **Hero section**: 89px heading, 21px subtext
2. **Section headings**: 55px
3. **Card titles**: 34px
4. **Body text**: 16px
5. **Captions**: 13px

## Whitespace Distribution
- **Between sections**: 89px
- **Within sections**: 55px
- **Between elements**: 34px
- **Between related items**: 21px
- **Tight spacing**: 13px

## Responsive Breakpoints (Fibonacci-based)
- **Mobile**: 377px
- **Tablet**: 610px
- **Desktop**: 987px (610 + 377)
- **Large**: 1597px (987 + 610)

## Benefits
- ✅ Natural, pleasing proportions
- ✅ Consistent visual rhythm
- ✅ Professional appearance
- ✅ Easy to scale
- ✅ Harmonious spacing
- ✅ Better readability
- ✅ Aesthetic balance

