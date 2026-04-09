// ==================== AUTHENTICATION FUNCTIONS ====================

// Track active nav
function setActiveNav(active) {
    const loginBtn = document.getElementById('loginNavBtn');
    const registerBtn = document.getElementById('registerNavBtn');
    
    if (active === 'login') {
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
    } else {
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');
    }
}

// Show Login Form
window.showLogin = function() {
    document.getElementById('loginCard').style.display = 'block';
    document.getElementById('registerCard').style.display = 'none';
    setActiveNav('login');
    
    // Clear errors
    document.getElementById('loginError').style.display = 'none';
};

// Show Register Form
window.showRegister = function() {
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('registerCard').style.display = 'block';
    setActiveNav('register');
    
    // Clear errors
    document.getElementById('registerError').style.display = 'none';
    document.getElementById('registerSuccess').style.display = 'none';
};

// Login function
window.login = async function() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorDiv = document.getElementById('loginError');
    
    errorDiv.style.display = 'none';
    
    if (!email || !password) {
        errorDiv.querySelector('span').innerText = 'Please enter username/email and password';
        errorDiv.style.display = 'flex';
        return;
    }
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Logged in:', userCredential.user.email);
    } catch (error) {
        let message = '';
        switch(error.code) {
            case 'auth/user-not-found':
                message = 'No account found with this email. Please register first.';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address.';
                break;
            case 'auth/too-many-requests':
                message = 'Too many attempts. Please try again later.';
                break;
            default:
                message = error.message;
        }
        errorDiv.querySelector('span').innerText = message;
        errorDiv.style.display = 'flex';
    }
};

// Register function
window.register = async function() {
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value.trim();
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Validation
    if (!fullName || !email || !password) {
        errorDiv.querySelector('span').innerText = 'Please fill all required fields';
        errorDiv.style.display = 'flex';
        return;
    }
    
    if (password.length < 6) {
        errorDiv.querySelector('span').innerText = 'Password must be at least 6 characters';
        errorDiv.style.display = 'flex';
        return;
    }
    
    if (!email.includes('@')) {
        errorDiv.querySelector('span').innerText = 'Please enter a valid email address';
        errorDiv.style.display = 'flex';
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        await db.collection('users').doc(user.uid).set({
            fullName: fullName,
            email: email,
            phone: phone || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            totalCalculations: 0,
            totalProfit: 0,
            totalLoans: 0,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await user.updateProfile({
            displayName: fullName
        });
        
        successDiv.querySelector('span').innerText = 'Account created successfully! Logging you in...';
        successDiv.style.display = 'flex';
        
    } catch (error) {
        let message = '';
        switch(error.code) {
            case 'auth/email-already-in-use':
                message = 'Email already in use. Please login instead.';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address.';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak. Use at least 6 characters.';
                break;
            default:
                message = error.message;
        }
        errorDiv.querySelector('span').innerText = message;
        errorDiv.style.display = 'flex';
    }
};

// Logout function
window.logout = async function() {
    try {
        await auth.signOut();
        console.log('User logged out');
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
    }
};