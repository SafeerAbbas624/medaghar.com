# Mobile Responsiveness Testing Guide

## How to Test Mobile Responsiveness

### Using Browser DevTools
1. Open Chrome/Firefox DevTools (F12)
2. Click the device toolbar icon (Ctrl+Shift+M)
3. Select different device presets:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPhone 14 Pro Max (430px)
   - iPad Mini (768px)
   - iPad Air (820px)
   - Samsung Galaxy S20 (360px)

### Custom Viewport Sizes
Test these breakpoints:
- **320px** - Very small phones
- **375px** - iPhone SE, small phones
- **390px** - iPhone 12/13/14
- **430px** - iPhone 14 Pro Max
- **640px** - Tailwind 'sm' breakpoint
- **768px** - Tailwind 'md' breakpoint (tablets)
- **1024px** - Tailwind 'lg' breakpoint (desktops)
- **1280px** - Tailwind 'xl' breakpoint

## Pages to Test

### ✅ 1. Home Page (/)
**Mobile (< 640px):**
- [ ] Hero section text is readable
- [ ] Search bar stacks vertically
- [ ] Buy/Rent buttons are full-width
- [ ] Quick links show 2 columns
- [ ] Property cards show 1 column
- [ ] All text fits without horizontal scroll

**Tablet (640px - 1024px):**
- [ ] Quick links show 3 columns
- [ ] Property cards show 2 columns
- [ ] Search bar is horizontal

**Desktop (> 1024px):**
- [ ] Quick links show 6 columns
- [ ] Property cards show 3 columns
- [ ] Full layout displays

### ✅ 2. Property Listing Page (/properties)
**Mobile:**
- [ ] Filters are collapsible/hidden
- [ ] Filter button is sticky/accessible
- [ ] Property cards show 1 column
- [ ] Map view works
- [ ] Sort dropdown is accessible
- [ ] Pagination works

**Tablet:**
- [ ] Property cards show 2 columns
- [ ] Filters may be in sidebar or collapsible

**Desktop:**
- [ ] Filters in left sidebar
- [ ] Property cards show 2-3 columns
- [ ] Map and list view toggle works

### ✅ 3. Property Detail Page (/properties/[id])
**Mobile:**
- [ ] Images display full-width
- [ ] Image gallery is swipeable
- [ ] Price is prominent and readable
- [ ] Property details stack vertically
- [ ] Agent card moves below main content
- [ ] Price history chart is readable
- [ ] Chart labels don't overlap
- [ ] Neighborhood scores show 1 column
- [ ] Map is interactive
- [ ] Contact buttons are accessible

**Tablet:**
- [ ] Neighborhood scores show 2 columns
- [ ] Layout uses available space

**Desktop:**
- [ ] Sidebar shows on right
- [ ] Neighborhood scores show 4 columns
- [ ] Full layout with all features

### ✅ 4. Plots Page (/plots)
**Mobile:**
- [ ] Filters are collapsible
- [ ] Plot cards show 1 column
- [ ] Map view works
- [ ] Filter chips are readable

**Tablet/Desktop:**
- [ ] Plot cards show 2-3 columns
- [ ] Filters in sidebar

### ✅ 5. Commercial Page (/commercial)
**Mobile:**
- [ ] Filters are collapsible
- [ ] Commercial cards show 1 column
- [ ] Property type filter works

**Tablet/Desktop:**
- [ ] Cards show 2-3 columns
- [ ] Filters in sidebar

### ✅ 6. Market Insights (/market-insights)
**Mobile:**
- [ ] Metric cards stack vertically
- [ ] Charts are readable
- [ ] Tables scroll horizontally if needed
- [ ] City filter dropdown works

**Tablet/Desktop:**
- [ ] Metric cards show in grid
- [ ] Charts use full width
- [ ] Tables display properly

### ✅ 7. Agent Finder (/agents)
**Mobile:**
- [ ] Agent cards show 1 column
- [ ] Search filters work
- [ ] Contact buttons are accessible

**Tablet/Desktop:**
- [ ] Agent cards show 2-3 columns

### ✅ 8. Reviews Page (/reviews)
**Mobile:**
- [ ] Review cards stack vertically
- [ ] Star ratings are visible
- [ ] Write review button is accessible
- [ ] Form fields are full-width

**Tablet/Desktop:**
- [ ] Reviews show in grid
- [ ] Filters work properly

### ✅ 9. Sign In/Sign Up Pages
**Mobile:**
- [ ] Form fields are full-width
- [ ] Buttons are touch-friendly (min 44px)
- [ ] Text is readable
- [ ] Social login buttons work
- [ ] Keyboard doesn't obscure inputs

**All Sizes:**
- [ ] Form validation messages display
- [ ] Submit button is accessible

### ✅ 10. User Profile (/profile)
**Mobile:**
- [ ] Profile sections stack vertically
- [ ] Edit buttons are accessible
- [ ] Saved properties show 1 column
- [ ] Tabs are scrollable if needed

**Tablet/Desktop:**
- [ ] Sections use grid layout
- [ ] Saved properties show 2-3 columns

## Component-Specific Tests

### Navbar
**Mobile:**
- [ ] Hamburger menu appears
- [ ] Menu opens/closes smoothly
- [ ] All links are accessible
- [ ] User menu works
- [ ] Logo is visible
- [ ] Messages badge shows

**Desktop:**
- [ ] Full horizontal menu
- [ ] Dropdowns work
- [ ] User avatar shows

### SearchBar
**Mobile:**
- [ ] Buy/Rent buttons are equal width
- [ ] Search input is full-width
- [ ] Search button is full-width
- [ ] Form stacks vertically
- [ ] Touch targets are adequate

**Desktop:**
- [ ] Horizontal layout
- [ ] Search button is inline

### PropertyCard
**Mobile:**
- [ ] Image displays properly
- [ ] Price is readable
- [ ] Bed/bath icons are visible
- [ ] Save button is accessible
- [ ] Compare button works
- [ ] Address doesn't overflow

**All Sizes:**
- [ ] Hover effects work (desktop)
- [ ] Touch interactions work (mobile)

### PriceHistoryChart
**Mobile:**
- [ ] Chart is readable
- [ ] Labels don't overlap
- [ ] Tooltips work on touch
- [ ] Timeline cards stack
- [ ] Insights box is readable

**Desktop:**
- [ ] Full chart displays
- [ ] All labels visible
- [ ] Hover tooltips work

### NeighborhoodInfo
**Mobile:**
- [ ] Score cards show 1 column
- [ ] Icons are visible
- [ ] Progress bars display
- [ ] Nearby places stack

**Tablet:**
- [ ] Score cards show 2 columns

**Desktop:**
- [ ] Score cards show 4 columns
- [ ] Nearby places in 2 columns

## Touch Interaction Tests

### Minimum Touch Targets
- [ ] All buttons are at least 44x44px
- [ ] Links have adequate spacing
- [ ] Form inputs are easy to tap
- [ ] Dropdowns are touch-friendly

### Gestures
- [ ] Image galleries support swipe
- [ ] Maps support pinch-to-zoom
- [ ] Scrolling is smooth
- [ ] Pull-to-refresh works (if implemented)

## Performance Tests

### Mobile Performance
- [ ] Pages load in < 3 seconds on 3G
- [ ] Images are optimized
- [ ] No layout shift (CLS)
- [ ] Smooth scrolling
- [ ] No janky animations

### Network Conditions
Test with Chrome DevTools throttling:
- [ ] Fast 3G
- [ ] Slow 3G
- [ ] Offline (if PWA features exist)

## Accessibility Tests

### Mobile Accessibility
- [ ] Text is readable (min 16px for body)
- [ ] Sufficient color contrast
- [ ] Form labels are visible
- [ ] Error messages are clear
- [ ] Focus indicators visible
- [ ] Screen reader friendly

### Keyboard Navigation (Tablets)
- [ ] Tab order is logical
- [ ] All interactive elements accessible
- [ ] Skip links work

## Browser Testing

### Mobile Browsers
- [ ] Chrome Mobile (Android)
- [ ] Safari iOS
- [ ] Firefox Mobile
- [ ] Samsung Internet
- [ ] Edge Mobile

### Tablet Browsers
- [ ] Safari iPad
- [ ] Chrome Tablet
- [ ] Edge Tablet

## Common Issues to Check

### Layout Issues
- [ ] No horizontal scrolling
- [ ] No content overflow
- [ ] Proper text wrapping
- [ ] Images don't break layout
- [ ] Modals fit on screen

### Typography Issues
- [ ] Text is readable (not too small)
- [ ] Line height is adequate
- [ ] Headings are properly sized
- [ ] No text cutoff

### Form Issues
- [ ] Inputs are large enough
- [ ] Labels are visible
- [ ] Validation messages show
- [ ] Submit buttons are accessible
- [ ] Proper input types (tel, email, number)

### Navigation Issues
- [ ] Menu is accessible
- [ ] Back button works
- [ ] Breadcrumbs work
- [ ] Links are tappable

## Testing Tools

### Browser DevTools
- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- Safari Web Inspector

### Online Tools
- Google Mobile-Friendly Test
- PageSpeed Insights (Mobile)
- BrowserStack (real devices)
- LambdaTest (real devices)

### Lighthouse Audits
Run Lighthouse for mobile:
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90

## Quick Test Checklist

For each page, quickly verify:
1. [ ] Loads without errors
2. [ ] No horizontal scroll
3. [ ] Text is readable
4. [ ] Buttons are tappable
5. [ ] Images display correctly
6. [ ] Forms work properly
7. [ ] Navigation is accessible
8. [ ] Content fits on screen

## Reporting Issues

When you find an issue, note:
- Page URL
- Device/viewport size
- Browser
- Screenshot
- Steps to reproduce
- Expected vs actual behavior

