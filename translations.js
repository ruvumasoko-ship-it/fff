// ==================== TRANSLATIONS ====================
const translations = {
    en: {
        // Navigation
        repairStatus: "Repair Status",
        login: "Login",
        register: "Register",
        pricing: "Pricing",
        
        // Login card
        welcomeBack: "Welcome Back",
        loginTo: "Login to your Biashara Rahisi",
        emailPlaceholder: "Email Address",
        passwordPlaceholder: "Password",
        rememberMe: "Remember Me",
        forgotPassword: "Forgot Password?",
        loginBtn: "Login",
        googleSignIn: "Sign in with Google",
        noAccount: "Not yet registered?",
        registerNow: "Register Now",
        
        // Register card
        createAccount: "Create Account",
        joinToday: "Join Biashara Rahisi today",
        fullNamePlaceholder: "Full Name",
        passwordPlaceholderReg: "Password (min. 6 characters)",
        phonePlaceholder: "Phone Number (Optional)",
        registerBtn: "Register",
        haveAccount: "Already have an account?",
        loginHere: "Login Here",
        
        // Dashboard
        logout: "Logout",
        totalCalculationsLabel: "Total Calculations",
        totalProfitLabel: "Total Profit",
        totalLoansLabel: "Loan Calculations",
        profitLossTitle: "Calculate Profit / Loss",
        revenueLabel: "Total Revenue (TZS)",
        expensesLabel: "Total Expenses (TZS)",
        yourResult: "Your Result",
        saveCalc: "Save Calculation",
        loanTitle: "Calculate Loan & Interest",
        loanAmountLabel: "Loan Amount (TZS)",
        interestLabel: "Monthly Interest (%)",
        monthsLabel: "Repayment (Months)",
        monthlyPaymentLabel: "Monthly Payment",
        recentActivities: "Recent Activities",
        noActivities: "No activities yet",
        
        // Alerts and messages (used in JS)
        pleaseFillFields: "Please fill all required fields",
        passwordMinLength: "Password must be at least 6 characters",
        invalidEmail: "Please enter a valid email address",
        emailInUse: "Email already in use. Please login instead.",
        weakPassword: "Password too weak. Use at least 6 characters.",
        accountCreated: "Account created successfully! Logging you in...",
        pleaseEnterEmailPassword: "Please enter email and password",
        noAccountFound: "No account found. Please register first.",
        incorrectPassword: "Incorrect password. Try again.",
        calculationSaved: "✓ Calculation saved!",
        errorSaving: "Error saving. Check console.",
        pleaseLoginFirst: "Please login first",
        resetEmailSent: "Password reset email sent. Check your inbox.",
        enterEmailFirst: "Please enter your email address first."
    },
    sw: {
        // Navigation
        repairStatus: "Hali ya Urekebishaji",
        login: "Ingia",
        register: "Jisajili",
        pricing: "Bei",
        
        // Login card
        welcomeBack: "Karibu Tena",
        loginTo: "Ingia kwenye Biashara Rahisi yako",
        emailPlaceholder: "Barua pepe",
        passwordPlaceholder: "Nenosiri",
        rememberMe: "Nikumbuke",
        forgotPassword: "Umesahau nenosiri?",
        loginBtn: "Ingia",
        googleSignIn: "Ingia kwa Google",
        noAccount: "Huna akaunti?",
        registerNow: "Jisajili Sasa",
        
        // Register card
        createAccount: "Unda Akaunti",
        joinToday: "Jiunge na Biashara Rahisi leo",
        fullNamePlaceholder: "Jina Kamili",
        passwordPlaceholderReg: "Nenosiri (herufi 6 au zaidi)",
        phonePlaceholder: "Namba ya Simu (Si Lazima)",
        registerBtn: "Jisajili",
        haveAccount: "Tayari una akaunti?",
        loginHere: "Ingia Hapa",
        
        // Dashboard
        logout: "Ondoka",
        totalCalculationsLabel: "Jumla ya Mahesabu",
        totalProfitLabel: "Jumla ya Faida",
        totalLoansLabel: "Mahesabu ya Mikopo",
        profitLossTitle: "Kokotoa Faida / Hasara",
        revenueLabel: "Jumla ya Mapato (TZS)",
        expensesLabel: "Jumla ya Gharama (TZS)",
        yourResult: "Matokeo Yako",
        saveCalc: "Hifadhi Hesabu",
        loanTitle: "Kokotoa Mkopo na Riba",
        loanAmountLabel: "Kiasi cha Mkopo (TZS)",
        interestLabel: "Riba kwa mwezi (%)",
        monthsLabel: "Muda wa kulipa (Miezi)",
        monthlyPaymentLabel: "Malipo ya kila mwezi",
        recentActivities: "Shughuli za Hivi Karibuni",
        noActivities: "Hakuna shughuli bado",
        
        // Alerts
        pleaseFillFields: "Tafadhali jaza sehemu zote zinazohitajika",
        passwordMinLength: "Nenosiri lazima iwe na angalau herufi 6",
        invalidEmail: "Tafadhali ingiza barua pepe sahihi",
        emailInUse: "Barua pepe tayari inatumika. Tafadhali ingia.",
        weakPassword: "Nenosiri dhaifu. Tumia angalau herufi 6.",
        accountCreated: "Akaunti imeundwa kikamilifu! Unaingizwa...",
        pleaseEnterEmailPassword: "Tafadhali ingiza barua pepe na nenosiri",
        noAccountFound: "Hakuna akaunti. Tafadhali jisajili kwanza.",
        incorrectPassword: "Nenosiri si sahihi. Jaribu tena.",
        calculationSaved: "✓ Hesabu imehifadhiwa!",
        errorSaving: "Hitilafu wakati wa kuhifadhi. Angalia console.",
        pleaseLoginFirst: "Tafadhali ingia kwanza",
        resetEmailSent: "Barua ya kuweka upya nenosiri imetumwa. Angalia barua pepe yako.",
        enterEmailFirst: "Tafadhali ingiza barua pepe yako kwanza."
    }
};

let currentLang = localStorage.getItem('language') || 'en'; // default English

function updateUILanguage() {
    const elements = document.querySelectorAll('[data-key]');
    elements.forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[currentLang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                const placeholderKey = el.getAttribute('data-key-placeholder');
                if (placeholderKey && translations[currentLang][placeholderKey]) {
                    el.placeholder = translations[currentLang][placeholderKey];
                }
            } else {
                el.innerText = translations[currentLang][key];
            }
        }
    });
    // Update placeholders for inputs that have data-key-placeholder
    const inputsWithPlaceholder = document.querySelectorAll('[data-key-placeholder]');
    inputsWithPlaceholder.forEach(input => {
        const key = input.getAttribute('data-key-placeholder');
        if (translations[currentLang][key]) {
            input.placeholder = translations[currentLang][key];
        }
    });
    // Update language toggle button text
    const langLabel = document.getElementById('langLabel');
    if (langLabel) {
        langLabel.innerText = currentLang === 'en' ? 'Kiswahili' : 'English';
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'sw' : 'en';
    localStorage.setItem('language', currentLang);
    updateUILanguage();
    // Also update any dynamic messages (like alerts) will be handled in JS functions
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUILanguage();
});
