// ==================== AUTHENTICATION FUNCTIONS ====================

function getTranslation(key) {
    return translations[currentLang][key] || key;
}

window.showLoginForm = function() {
    console.log("Showing login form");
    document.getElementById('loginCard').style.display = 'block';
    document.getElementById('registerCard').style.display = 'none';
    document.getElementById('loginNavBtn').classList.add('active');
    document.getElementById('registerNavBtn').classList.remove('active');
    document.getElementById('loginError').style.display = 'none';
};

window.showRegisterForm = function() {
    console.log("Showing register form");
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('registerCard').style.display = 'block';
    document.getElementById('registerNavBtn').classList.add('active');
    document.getElementById('loginNavBtn').classList.remove('active');
    document.getElementById('registerError').style.display = 'none';
    document.getElementById('registerSuccess').style.display = 'none';
};

window.loginUser = async function() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    errorDiv.style.display = 'none';
    
    if (!email || !password) {
        errorDiv.querySelector('span').innerText = getTranslation('pleaseEnterEmailPassword');
        errorDiv.style.display = 'flex';
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        console.log("Login successful");
    } catch (error) {
        let message = '';
        switch(error.code) {
            case 'auth/user-not-found':
                message = getTranslation('noAccountFound');
                break;
            case 'auth/wrong-password':
                message = getTranslation('incorrectPassword');
                break;
            case 'auth/invalid-email':
                message = getTranslation('invalidEmail');
                break;
            default:
                message = error.message;
        }
        errorDiv.querySelector('span').innerText = message;
        errorDiv.style.display = 'flex';
    }
};

window.registerUser = async function() {
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value.trim();
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    if (!fullName || !email || !password) {
        errorDiv.querySelector('span').innerText = getTranslation('pleaseFillFields');
        errorDiv.style.display = 'flex';
        return;
    }
    if (password.length < 6) {
        errorDiv.querySelector('span').innerText = getTranslation('passwordMinLength');
        errorDiv.style.display = 'flex';
        return;
    }
    if (!email.includes('@')) {
        errorDiv.querySelector('span').innerText = getTranslation('invalidEmail');
        errorDiv.style.display = 'flex';
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        await db.collection('users').doc(user.uid).set({
            fullName: fullName, email: email, phone: phone || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            totalCalculations: 0, totalProfit: 0, totalLoans: 0,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        await user.updateProfile({ displayName: fullName });
        successDiv.querySelector('span').innerText = getTranslation('accountCreated');
        successDiv.style.display = 'flex';
    } catch (error) {
        let message = '';
        switch(error.code) {
            case 'auth/email-already-in-use':
                message = getTranslation('emailInUse');
                break;
            case 'auth/invalid-email':
                message = getTranslation('invalidEmail');
                break;
            case 'auth/weak-password':
                message = getTranslation('weakPassword');
                break;
            default:
                message = error.message;
        }
        errorDiv.querySelector('span').innerText = message;
        errorDiv.style.display = 'flex';
    }
};

window.logoutUser = async function() {
    try {
        await auth.signOut();
    } catch (error) {
        console.error("Logout error:", error);
        alert(error.message);
    }
};

window.googleSignIn = async function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            await userRef.set({
                fullName: user.displayName || user.email.split('@')[0],
                email: user.email,
                phone: user.phoneNumber || '',
                photoURL: user.photoURL || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                totalCalculations: 0, totalProfit: 0, totalLoans: 0,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await userRef.update({ lastLogin: firebase.firestore.FieldValue.serverTimestamp() });
        }
    } catch (error) {
        const errorDiv = document.getElementById('loginError');
        errorDiv.querySelector('span').innerText = error.message;
        errorDiv.style.display = 'flex';
    }
};

window.forgotPassword = async function() {
    const email = document.getElementById('loginEmail').value.trim();
    if (!email) {
        const errorDiv = document.getElementById('loginError');
        errorDiv.querySelector('span').innerText = getTranslation('enterEmailFirst');
        errorDiv.style.display = 'flex';
        return;
    }
    try {
        await auth.sendPasswordResetEmail(email);
        alert(getTranslation('resetEmailSent'));
    } catch (error) {
        const errorDiv = document.getElementById('loginError');
        let message = error.code === 'auth/user-not-found' ? getTranslation('noAccountFound') : error.message;
        errorDiv.querySelector('span').innerText = message;
        errorDiv.style.display = 'flex';
    }
};
