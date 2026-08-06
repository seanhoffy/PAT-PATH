# PATpath.org - CEP Psilocybin-Assisted Therapy Demand Model

A comprehensive React web application for modeling and estimating demand for psilocybin-assisted therapy (PSIL-AT) for depression treatment. This application is based on peer-reviewed research by Rab et al, 2024 and provides an interactive platform for healthcare professionals, researchers, and policymakers to estimate treatment demand across different geographic regions.

## 🎯 Project Overview

This application implements the CEP (Cost-Effectiveness and Policy) Model for psilocybin-assisted therapy demand estimation. It allows users to:

- **Customize Input Parameters**: Adjust demographic data, exclusion criteria, and geographic-specific variables
- **Calculate Treatment Demand**: Generate estimates for Major Depressive Disorder (MDD) and Treatment-Resistant Depression (TRD) populations
- **Generate Detailed Reports**: Create comprehensive PDF reports with all inputs and results
- **Save and Manage Models**: Store calculation history and results in user accounts

## 🚀 Key Features

### Interactive Model Calculator
- **Customizable Geographic Areas**: Input specific regions or populations
- **Adjustable Exclusion Criteria**: Modify percentages for various medical conditions
- **Real-time Calculations**: Instant results with three different scenarios:
  - **Trial Eligibility**: 24% of base population
  - **Real-world Eligibility**: After applying medical exclusions
  - **Comorbid Conditions**: Accounting for psychological and health comorbidities

### User Management System
- **User Registration & Authentication**: Secure login via Firebase Authentication
- **Model History**: Save and retrieve previous calculations
- **Personalized Dashboard**: Access to saved models and results

### Professional Reporting
- **PDF Report Generation**: Comprehensive reports including:
  - All input parameters and assumptions
  - Detailed calculation results
  - Geographic and demographic context
  - Professional formatting for presentations and documentation

### Modern User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Material-UI Components**: Professional, accessible interface
- **Intuitive Navigation**: Clear workflow from landing page to results

## 🏗️ Technical Architecture

### Frontend
- **React 19**: Modern React with hooks and functional components
- **Material-UI (MUI)**: Professional UI component library
- **React Router**: Client-side routing and navigation
- **React PDF Renderer**: Dynamic PDF generation

### Backend & Data
- **Firebase Authentication**: Secure user management
- **Firestore Database**: Cloud-based data storage for user models
- **Python Model**: Core mathematical calculations (see `src/model_math.py`)

### Key Dependencies
- `@mui/material` & `@mui/icons-material`: UI components
- `@react-pdf/renderer`: PDF generation
- `react-number-format`: Formatted number inputs
- `firebase`: Authentication and database
- `react-firebase-hooks`: Firebase integration

## 📊 Model Methodology

The application implements a peer-reviewed model that:

1. **Identifies Eligible Populations**: Filters MDD and TRD populations based on validated inclusion/exclusion criteria
2. **Applies Medical Exclusions**: Accounts for conditions that contraindicate psilocybin therapy:
   - Bipolar disorder and mania
   - Active suicidal ideation
   - Cardiovascular conditions
   - Neurological disorders
   - Hepatic conditions
   - Personality disorders
3. **Considers Comorbidities**: Adjusts for psychological and health comorbidities
4. **Geographic Customization**: Allows region-specific population adjustments

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase project (for authentication and database)

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd psil-at-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update `src/firebase.js` with your Firebase configuration

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
psil-at-app/
├── public/                 # Static assets
│   ├── index.html         # Main HTML template
│   ├── cepLogo2.png       # CEP logo
│   └── heroim.png         # Hero background image
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── inputs_and_outputs.js    # Main calculator component
│   │   ├── NavBar.js               # Navigation component
│   │   ├── SimpleNavBar.js         # Simplified navigation
│   │   ├── sources.js              # Data source management
│   │   └── pdf/                    # PDF generation components
│   ├── routes/            # Page components
│   │   ├── LandingPage.js          # Homepage with feature overview
│   │   ├── HomePage.js             # Main calculator page
│   │   ├── LoginPage.js            # User authentication
│   │   ├── Register.js             # User registration
│   │   └── research_paper.js       # PDF viewer
│   ├── model_math.py     # Core mathematical model
│   ├── firebase.js       # Firebase configuration
│   └── App.js            # Main application component
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🔧 Available Scripts

- **`npm start`**: Runs the app in development mode
- **`npm test`**: Launches the test runner
- **`npm run build`**: Builds the app for production
- **`npm run eject`**: Ejects from Create React App (one-way operation)

## 📚 Usage Guide

### For New Users
1. Visit the landing page to learn about the model
2. Register for an account or log in
3. Navigate to the calculator page
4. Enter your geographic area and model title
5. Adjust population parameters as needed
6. Review and submit calculations
7. Download your comprehensive PDF report

### For Researchers
- Use the customizable inputs to test different scenarios
- Generate reports for academic presentations
- Save multiple models for comparison
- Export results for further analysis

### For Healthcare Professionals
- Estimate treatment demand for specific regions
- Plan resource allocation based on model outputs
- Generate professional reports for stakeholders
- Track changes in demand over time

## ⚠️ Known Naming Discrepancies

- The "General Info" field labeled **Organization** in the UI (formerly "Model Title") is still stored internally as `modelTitle` (component state, Firestore `inputs.modelTitle`/saved-model `title`, PDF export, filenames, etc.). Only the user-facing label changed — the internal field name was left as-is to avoid a wider refactor across `inputs_and_outputs.js`, `HistoryPage.js`, `pdf.js`, `NavBar.js`, `firebaseHelpers.js`, and `formValidation.js`. Keep this in mind when reading/writing that field in code.
- The double-counting field labeled **Psychological Disorders (Mania, Suicide)** in the UI (formerly "Psychological Problems (Manic, Suicide)") is still stored internally as `psycological_P` (note the original typo in the key itself — `psycological` not `psychological`).
- The double-counting field labeled **Hepatic Impairments** in the UI (formerly "Lower Hepatic Impairment") is still stored internally as `comorbid_hepatic_P`.
- Both of the above are defined once in `DOUBLE_COUNTING_FIELDS` (`src/constants/formFields.js`) and referenced from there by `DoubleCountingDialog.js` and `HistoryPage.js`; only `pdf.js` has its own separate hardcoded copy of the label text (kept in sync manually, since the PDF export doesn't import from `formFields.js`).

## 🔒 Security & Privacy

- **User Authentication**: Secure login via Firebase
- **Data Protection**: User data stored securely in Firestore
- **Development Notice**: Clear warnings about development status
- **Input Validation**: Comprehensive form validation

## 🤝 Contributing

This project is developed by the Collaborative for the Economics of Psychedelics (CEP) at UC Berkeley. For contributions or questions, please contact the development team.

## 📄 License

This project is proprietary software developed for research and policy analysis purposes.

## 🙏 Acknowledgments

- **Research Foundation**: Based on peer-reviewed work by Rab et al, 2024
- **CEP Team**: University of California, Berkeley
- **Development Team**: PSIL-AT Application Development

---

**Note**: This application is currently under development and intended for testing and research purposes only.
