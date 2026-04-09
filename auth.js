// ==================== AUTHENTICATION FUNCTIONS ====================

// Show Login Form
window.showLoginForm = function() {
    console.log("Showing login form");
    document.getElementById('loginCard').style.display = 'block';
    document.getElementById('registerCard').style.display = 'none';
    
    document.getElementById('loginNavBtn').classList.add('active');
    document.getElementById('registerNavBtn').classList.remove('active');
    
    document.getElementById('loginError').style.display = 'none';
};

// Show Register Form
window.showRegisterForm = function() {
    console.log("Showing register form");
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('registerCard').style.display = 'block';
    
    document.getElementById('registerNavBtn').classList.add('active');
    document.getElementById('loginNavBtn').classList.remove('active');
    
    document.getElementById('registerError').style.display = 'none';
    document.getElementById('registerSuccess').style.display = 'none';
};

// Login User
window.loginUser = async function() {
    console.log("Login function called");
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    errorDiv.style.display = 'none';
    
    if (!email || !password) {
        errorDiv.querySelector('span').innerText = 'Please enter email and password';
        errorDiv.style.display = 'flex';
        return;
    }
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log("Login successful:", userCredential.user.email);
    } catch (error) {
        console.error("Login error:", error.code);
        let message = '';
        switch(error.code) {
            case 'auth/user-not-found':
                message = 'No account found. Please register first.';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password. Try again.';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address.';
                break;
            default:
                message = error.message;
        }
        errorDiv.querySelector('span').innerText = message;
        errorDiv.style.display = 'flex';
    }
};

// Register User
window.registerUser = async function() {
    console.log("Register function called");
    
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value.trim();
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
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
        
        await user.updateProfile({ displayName: fullName });
        
        successDiv.querySelector('span').innerText = 'Account created successfully! Logging you in...';
        successDiv.style.display = 'flex';
        
    } catch (error) {
        console.error("Register error:", error.code);
        let message = '';
        switch(error.code) {
            case 'auth/email-already-in-use':
                message = 'Email already in use. Please login instead.';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address.';
                break;
            case 'auth/weak-password':
                message = 'Password too weak. Use at least 6 characters.';
                break;
            default:
                message = error.message;
        }
        errorDiv.querySelector('span').innerText = message;
        errorDiv.style.display = 'flex';
    }
};

// Logout User
window.logoutUser = async function() {
    console.log("Logout function called");
    try {
        await auth.signOut();
    } catch (error) {
        console.error("Logout error:", error);
        alert('Error logging out. Please try again.');
    }
};
