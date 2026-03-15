# Fonts and Icons - Offline Configuration

This document explains how fonts and icons are configured to work offline in the Superadmin Panel.

## Cairo Font (Arabic Support)

The application uses the Cairo font family for full Arabic language support. All font files are bundled locally using the `@fontsource/cairo` package.

### Installation
```bash
npm install @fontsource/cairo
```

### Configuration
In `src/styles.scss`, we import all Cairo font weights:
```scss
@import '@fontsource/cairo/200.css';
@import '@fontsource/cairo/300.css';
@import '@fontsource/cairo/400.css';
@import '@fontsource/cairo/500.css';
@import '@fontsource/cairo/600.css';
@import '@fontsource/cairo/700.css';
@import '@fontsource/cairo/800.css';
@import '@fontsource/cairo/900.css';
```

### Font Stack
The body font family includes fallbacks for maximum compatibility:
```scss
body {
  font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
               'Helvetica Neue', Arial, 'Noto Sans Arabic', sans-serif;
}
```

## Material Symbols Icons

Material Symbols icons are loaded locally from the `material-symbols` package for complete offline functionality.

### Installation
```bash
npm install material-symbols
```

### Configuration
In `src/styles.scss`, we define a custom @font-face with optimized settings:
```scss
@font-face {
  font-family: 'Material Symbols Outlined';
  font-style: normal;
  font-weight: 100 700;
  font-display: swap;
  src: url('../node_modules/material-symbols/material-symbols-outlined.woff2') format('woff2');
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: 'liga';
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}
```

Key improvements:
- `font-display: swap` - Shows fallback text immediately while font loads
- Direct path to WOFF2 file for better build optimization
- Complete font properties for consistent rendering

### Usage in Templates
```html
<span class="material-symbols-outlined">home</span>
<span class="material-symbols-outlined">settings</span>
<span class="material-symbols-outlined">person</span>
<span class="material-symbols-outlined">shopping_bag</span>
<span class="material-symbols-outlined">verified</span>
```

### Icon Names
Material Symbols uses lowercase names with underscores:
- `home` not `Home`
- `shopping_bag` not `shopping-bag`
- `arrow_forward` not `arrow-forward`

## Build Output

After building the application, all fonts are bundled in the `dist/superadmin-panel/browser/media/` directory:

- Cairo fonts: `cairo-*.woff2` and `cairo-*.woff` files (multiple weights and subsets)
- Material Symbols: `material-symbols-outlined-*.woff2` (single file, ~3.8MB)

## Browser Compatibility

The `.browserslistrc` file ensures fonts work across all modern browsers:
```
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions
```

## Performance Optimization

1. Font files are preloaded in `index.html` for faster initial rendering
2. `font-display: swap` prevents invisible text during font loading
3. WOFF2 format provides excellent compression (smaller file sizes)
4. All fonts are bundled during build, no runtime downloads needed

## No External Dependencies

All fonts and icons work completely offline without any CDN dependencies. The application will function properly on any device and any browser without internet connectivity.
