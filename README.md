# Senior Fitness and Activity Tracker

A web-based physical activity scheduler and tracker designed for older adults. This application is aligned with the Centers for Disease Control and Prevention (CDC) physical activity guidelines for older adults, tracking aerobic exercise minutes, muscle-strengthening sessions, and balance-training days.

## Accessibility Features

The user interface incorporates specific design choices to accommodate seniors and those with accessibility needs:

*   **High-Contrast Color Palette**: Uses a light amber background with deep blue and dark gray text elements to optimize readability.
*   **Large Touch Targets**: Actionable buttons and inputs are sized to meet or exceed touch target guidelines for older adults.
*   **Text Size Scaling**: Users can toggle between normal and larger text sizes to scale the interface fonts dynamically.
*   **Audio Guide**: Built-in Text-to-Speech functionality reads instructions and safety guidelines aloud.

## Core Features

*   **CDC Guideline Integration**:
    *   Tracks the recommended 150 minutes of moderate-intensity aerobic physical activity per week.
    *   Tracks muscle-strengthening activities (at least 2 days a week).
    *   Tracks balance-training activities (at least 3 days a week).
*   **Weekly Calendar**:
    *   A pre-populated default weekly schedule based on typical CDC recommendations.
    *   An interface to complete, modify, or add custom activities for each day of the week.
*   **Active Countdown Timer**:
    *   A large high-contrast visual timer.
    *   Quick presets for standard exercise intervals.
    *   Plays an audio alert upon timer completion and provides an interface to log the session.
*   **Local State Persistence**:
    *   Saves schedule, logging history, and accessibility preferences to the browser's localStorage.

## Tech Stack

*   **Framework**: Next.js 15+ (App Router) with TypeScript
*   **Styling**: Tailwind CSS
*   **Animations**: Motion (motion/react) for transitional effects
*   **Icons**: Lucide React

## Local Development and Deployment

To run the application locally:

1. Install the dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

To deploy the application to Vercel or other cloud providers, import the repository and trigger the standard Next.js build.

## Mobile Application Compilation

This project is configured for Capacitor, enabling compilation to native Android.

1. Build the static Next.js assets:
   ```bash
   npm run build
   ```
2. Initialize and configure Android support:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init "Senior Fitness Tracker" "com.seniorfitness.app" --web-dir=out
   npm install @capacitor/android
   npx cap add android
   ```
3. Synchronize assets and open in Android Studio:
   ```bash
   npx cap sync
   npx cap open android
   ```
   From Android Studio, compile the project to generate a native APK.
