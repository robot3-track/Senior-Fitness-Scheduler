# Senior Fitness and Activity Tracker

A web-based (but can be built as mobile app too!) physical activity scheduler and tracker designed for older adults. This application is aligned with the Centers for Disease Control and Prevention (CDC) physical activity guidelines for older adults, tracking aerobic exercise minutes, muscle-strengthening sessions, and balance-training days. This app also follows and supports two of the UN Sustainbility Goals.

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

## UN Sustainable Goals Alignments

*  **UN Goal #3**: Ensure healthy lives and promote well-being for all at all ages. The UN explicitly emphasizes that "at all ages" includes our rapidly growing global aging population, which shows the purpose of the app is for promoting healthy lives for the aging population. With CDC guidelines (150 minutes of aerobic activity, plus strength and balance training), the app directly combats age-related non-communicable conditions like cardiovascular disease, type 2 diabetes, and osteoporosis. This aligns with Target 3.4.

*  **UN Goal #10**: Reduce inequality within and among countries. This app promotes social and digital inclusion regardless of age or disability. A common problem seen is that older adults are frequently left behind by the modern "digital health" revolution because apps are often built with tiny fonts, low contrast, complex navigation, and assumptions about high digital literacy. However, since this app has BIG Text Toggle, high-contrast borders, tremor-safe step-trackers, and slow-cadence Text-to-Speech, this app ensures that health-tech is accessible to individuals with visual impairments, motor-control friction, or cognitive decline. This aligns with Target 10.2.

## Tech Stack

*   **Framework**: Next.js 15+ (App Router) with TypeScript
*   **Styling**: Tailwind CSS
*   **Animations**: Motion (motion/react) for simple yet impactful transitional effects
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

Key point: For app to run smoothly, be sure to add your own GEMINI_API_KEY under .env file or Vercel deployment.

This app also can be built as a mobile application.

# Try it now!

Try out the official deployed project here at: https://senior-fitness-scheduler.vercel.app/ !
