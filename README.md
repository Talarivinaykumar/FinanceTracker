# Personal Finance Companion Mobile App

A clean, modern, and lightweight mobile application designed to help users track their daily transactions, understand their spending habits, and manage simple financial goals.

## Overview

This application is built using React Native and Redux Toolkit. It avoids unnecessary complexity (not a full banking app) and focuses heavily on UI/UX with a clean, smooth, and highly responsive user experience. 

It tracks all your finances locally on-device, meaning no internet connection is required for day-to-day transaction recording.

### Key Features
1. **Home Dashboard:**
   - Displays real-time Current Balance, Total Income, and Total Expense with a clean aesthetic.
   - Summarizes your most recent transactions instantly.
2. **Transaction Management:**
   - Add Income and Expenses effortlessly via a bottom-sheet styled modal.
   - Create custom categories with custom emojis straight from the Add Transaction screen!.
   - Scrollable, neat flat list reviewing all historical transactions.
3. **Insights Screen:**
   - Features a dynamic **Pie Chart** separating your expenses by categories.
   - Highlights your highest spending category immediately.
4. **Savings Goals:**
   - Ability to declare a Savings Goal and a target amount.
   - Beautiful custom progress bars track your completion towards your target.

## Tech Stack
- **Framework:** React Native
- **State Management:** Redux Toolkit (`@reduxjs/toolkit` and `react-redux`)
- **Persistence:** `@react-native-async-storage/async-storage` wrapped with `redux-persist` to maintain data across reboots.
- **Navigation:** `@react-navigation/native` and `@react-navigation/bottom-tabs`
- **Charts:** `react-native-chart-kit` and `react-native-svg`
- **Icons:** `lucide-react-native`

## Setup Steps

### Prerequisites
1. Node.js (>= 18 recommended)
2. React Native CLI environment setup (Android Studio / Xcode)
3. NPM or Yarn

### Installation
1. Navigate to the project directory:
   ```bash
   cd FinanceTracker/FTA
   ```
2. Install the exact dependencies required:
   ```bash
   npm install
   ```
3. *(iOS Only)* Install CocoaPods
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App
- **Android:**
  ```bash
  npx react-native run-android
  ```
- **iOS:**
  ```bash
  npx react-native run-ios
  ```

## Assumptions
- **Local Persistence Only:** The requirement explicitly pointed towards AsyncStorage, so the app assumes device-centric data usage. Syncing across devices is not implemented.
- **Base Currency:** All currencies are formatted implicitly in USD ($) for simplicity. This can be localized easily if required via i18n libraries.
- **React Native CLI over Expo:** The provided user directory `FTA` already featured a standard React Native CLI bundle, so execution targeted a non-Expo flow while respecting all logic and UI requirements requested. (Note: The packages chosen are 100% Expo-compatible if transferred to an Expo Managed module.)

## Folder Structure

```
FTA/
├── src/
│   ├── components/
│   │   ├── AddTransactionModal.tsx  # Modal form for inputting transactions
│   │   ├── ProgressBar.tsx          # Custom UI element for tracking goals
│   │   └── TransactionCard.tsx      # A reusable card displaying an item
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Bottom tab layout and routing
│   ├── screens/
│   │   ├── GoalsScreen.tsx          # Maps tracking components
│   │   ├── HomeScreen.tsx           # Dashboard summaries
│   │   ├── InsightsScreen.tsx       # Embedded PieChart
│   │   └── TransactionsScreen.tsx   # Detailed feed of history
│   └── store/
│       ├── financeSlice.ts          # Redux slice governing financial rules
│       ├── hooks.ts                 # Strongly-typed Redux accessors
│       └── store.ts                 # Redux engine and persistence gateway
├── App.tsx                          # Base providers and entry
└── package.json
```
