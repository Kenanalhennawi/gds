# GDS Decoder - Enterprise Edition

A powerful, modern web application for parsing and analyzing GDS (Global Distribution System) history logs, PNR data, and EDIFACT messages. Built with vanilla JavaScript, featuring real-time analysis and comprehensive rate calculations.

## ✨ Features

### 📊 GDS Decoder
- **Automatic Log Parsing**: Paste raw GDS history logs and get instant analysis
- **Real-time Analysis**: Auto-analyzes input as you type with intelligent debouncing
- **Comprehensive Event Detection**: 
  - Booking changes (cancellations, reissues, modifications)
  - Flight disruptions (FDIS)
  - Segment status changes
  - Passenger information extraction
  - SSR (Special Service Requests) parsing
  - OSI (Other Service Information) parsing
- **Visual Timeline**: Beautiful, interactive timeline showing all detected events
- **Change Detection**: Highlights significant booking changes with detailed explanations
- **Code Translation**: Automatic translation of GDS codes to human-readable text

### ✈️ Excess Baggage Calculator
- **Multi-Airline Support**: Calculate rates for FZ (Flydubai), EK (Emirates), AC (Air Canada), and OAL (Other Airlines)
- **Comprehensive Rate Calculation**:
  - Excess Baggage (per KG and per Piece)
  - Go-Show Fares
  - Upgrade to Business rates
  - Sports Equipment fees
  - Late/Early Reporting fees
  - Transfer Baggage fees
- **Zone-Based Pricing**: Automatic zone classification for accurate rate calculation
- **Currency Support**: Multiple currencies with auto-selection based on origin/destination
- **Smart Airport Search**: Autocomplete with IATA code, city, or country search
- **Interactive UI**: Modern, responsive design with real-time calculations

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server or build process required - runs entirely in the browser

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start using immediately!

### Usage

#### GDS Decoder
1. Click on the "GDS Decoder" tab
2. Paste your GDS history log into the input area
3. Analysis starts automatically as you type
4. View results in the timeline panel on the right

#### Excess Baggage Calculator
1. Click on the "Excess Baggage" tab
2. Select origin and destination airports (use autocomplete)
3. Choose airline and currency
4. Select service type (Excess Baggage, Go-Show, etc.)
5. View calculated rates instantly

## 🏗️ Project Structure

```
gds-main/
├── index.html              # Main HTML structure
├── style.css               # All styling and animations
├── README.md              # This file
├── assets/
│   └── flydubai-bg.jpg    # Background image
└── src/
    ├── main.js            # Application entry point
    ├── parser.js          # GDS log parsing logic
    ├── analyzer.js        # Booking change analysis
    ├── ui.js              # Timeline rendering
    ├── translator.js      # Code translation utilities
    ├── excessBaggage.js  # Rate calculation logic
    ├── excessBaggageUI.js # Calculator UI
    ├── airportSearch.js  # Airport data and search
    └── data.json         # GDS code dictionary
```

## 🎨 Design Features

- **Modern Glassmorphism**: Beautiful glass-effect panels with backdrop blur
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Dark Theme**: Eye-friendly dark color scheme
- **Smooth Animations**: Polished transitions and micro-interactions
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## 🔧 Technical Details

### Performance Optimizations
- **Debouncing**: Input analysis is debounced to prevent excessive processing
- **RequestIdleCallback**: Heavy operations use browser idle time
- **Lazy Loading**: Excess baggage calculator loads on demand
- **CSS Containment**: Optimized rendering with `contain` property
- **GPU Acceleration**: Hardware-accelerated animations

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Code Quality

- **ES6 Modules**: Modern JavaScript module system
- **Error Handling**: Comprehensive error handling without console pollution
- **Accessibility**: WCAG 2.1 compliant
- **No Dependencies**: Pure vanilla JavaScript - no frameworks required

## 🛠️ Development

### Making Changes
1. Edit files in the `src/` directory
2. Refresh browser to see changes
3. No build process needed

### Key Files to Modify
- `src/parser.js`: Modify parsing logic for different GDS formats
- `src/translator.js`: Add new code translations
- `src/excessBaggage.js`: Update rate tables and calculations
- `style.css`: Customize appearance and layout

## 📄 License

© Created by Kenan Alhennawi 2026

## 🤝 Contributing

This is a private project. For suggestions or improvements, please contact the maintainer.

## 🐛 Known Issues

None currently. If you encounter any issues, please report them.

## 🔮 Future Enhancements

- Additional airline support
- More GDS format support
- Enhanced visualization options
- Export functionality (planned)
- Settings persistence (planned)

---

**Built with ❤️ for the aviation industry**
