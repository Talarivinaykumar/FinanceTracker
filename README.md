# FinanceTracker (FTA)

Welcome to **FinanceTracker**, a sleek, offline-first personal finance application built with React Native.

This application allows users to log and monitor their daily expenses, create saving goals, visualize their financial habits via interactive charts, and secure their sensitive data with biometric locks—all wrapped in a premium custom aesthetic.

---

## 🌟 Key Features

* **Offline-First Architecture:** Logs and histories are cached instantaneously giving a lightning-fast experience without relying on API latencies. 
* **Biometric Lockout:** Integrated FaceID/TouchID functionality using `react-native-biometrics` to keep unauthorized eyes off your cashflow.
* **Smart Notifications:** Dynamic, staggering local notifications to alert you to budget breakers or successful milestone hits, complete with swipe-to-clear gesture support.
* **Fluid Layout Animations:** Built primarily with native layout tools for high frame-rate screen transitions and list modifications.
* **Premium Custom Theming:** Utilizes an elegant, bespoke Dark Mode / Light Mode capability rather than relying on bloated UI frameworks.

---

## 🛠️ Technology Stack

- **Framework:** React Native CLI (Bare Workflow) + TypeScript
- **State Management:** Redux Toolkit (RTK) + React-Redux
- **Data Persistence:** AsyncStorage + Redux-Persist
- **Navigation:** React Navigation (Native Stack & Bottom Tabs)
- **Icons & Graphics:** `lucide-react-native` and `react-native-svg`
- **Charts:** `react-native-chart-kit`

---

## ⚙️ Setup Instructions

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v18+ recommended)
- **Java Development Kit (JDK)** 17+
- **Android Studio** (for Android) or **Xcode** (for iOS, Mac only)
- **CocoaPods** (for iOS dependencies)

### Installation

1. **Install dependencies:**
   Navigate into your project folder and run:
   ```bash
   npm install
   ```

2. **iOS Native Setup (Mac Only):**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Running the App:**
   - **For Android:**
     ```bash
     npm run android
     ```
   - **For iOS:**
     ```bash
     npm run ios
     ```

---

## 🚫 Known Limitations & Constraints

* **Storage Constraints:** Built on top of `AsyncStorage`. Massive querying (10,000+ entries) may encounter frame drops, as it isn't an indexable database.
* **No Cloud Sync:** Missing a remote sync feature (e.g. Supabase, Firebase). App termination or cache clearing permanently wipes data unless manually exported.
* **Headless Background Processes:** Notifications presently hinge upon foreground trigger triggers. True "scheduled while killed" actions demand deeper Headless JS configuration.

---

## 🚀 Roadmap / Areas for Improvement

1. **WatermelonDB/SQLite Migration:** To securely encrypt data underneath the OS layer and introduce rapid multi-join querying.
2. **Push Capabilities & Cloud Sync:** Moving persistence arrays up into a cloud graph like Supabase so users can migrate devices.
3. **Receipt Parsing:** Integrating `react-native-vision-camera` to scan receipts and log complex data lines automatically.
4. **Enhanced Analytics:** Weekly granularity vs Monthly granularity breakdown toggles.

---
*Developed with focus on performance, security, and dynamic UI design.*
