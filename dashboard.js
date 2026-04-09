// ==================== DASHBOARD FUNCTIONS ====================

let currentUser = null;
let totalProfitSum = 0;
let totalLoanCount = 0;

// Update profit calculation in real-time
function updateDashboardProfit() {
    const mapato = parseFloat(document.getElementById('dashboardMapato').value) || 0;
    const gharama = parseFloat(document.getElementById('dashboardGharama').value) || 0;
    const faida = mapato - gharama;
    const element = document.getElementById('dashboardFaidaValue');
    
    if (faida >= 0) {
        element.innerHTML = `TZS ${faida.toLocaleString()} (Profit)`;
        element.style.color = "#ffffff";
    } else {
        element.innerHTML = `TZS ${Math.abs(faida).toLocaleString()} (Loss)`;
        element.style.color = "#ffcccc";
    }
}

// Update loan calculation in real-time
function updateDashboardLoan() {
    const amount = parseFloat(document.getElementById('dashboardLoanAmount').value) || 0;
    const rate = parseFloat(document.getElementById('dashboardInterestRate').value) || 0;
    const months = parseFloat(document.getElementById('dashboardLoanMonths').value) || 1;
    
    let monthlyPayment = 0;
    let totalPayment = 0;
    
    if (amount > 0 && months > 0) {
        const monthlyRate = rate / 100;
        if (monthlyRate === 0) {
            monthlyPayment = amount / months;
        } else {
            monthlyPayment = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
        }
        totalPayment = monthlyPayment * months;
    }
    
    document.getElementById('dashboardMonthlyPayment').innerHTML = `TZS ${Math.round(monthlyPayment).toLocaleString()}`;
    document.getElementById('dashboardTotalPayment').innerHTML = `Total Repayment: TZS ${Math.round(totalPayment).toLocaleString()}`;
}

// Save Profit Calculation
window.saveProfitCalculation = async function() {
    if (!currentUser) {
        alert('Please login first');
        return;
    }
    
    const mapato = parseFloat(document.getElementById('dashboardMapato').value) || 0;
    const gharama = parseFloat(document.getElementById('dashboardGharama').value) || 0;
    const faida = mapato - gharama;
    
    const calculationData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        type: 'profit',
        data: { mapato, gharama, faida },
        result: faida >= 0 ? `Profit: TZS ${faida.toLocaleString()}` : `Loss: TZS ${Math.abs(faida).toLocaleString()}`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection('calculations').add(calculationData);
        
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        const currentCount = userDoc.data()?.totalCalculations || 0;
        const currentProfitSum = userDoc.data()?.totalProfit || 0;
        
        await userRef.update({ 
            totalCalculations: currentCount + 1,
            totalProfit: currentProfitSum + (faida > 0 ? faida : 0)
        });
        
        alert('✓ Profit/Loss calculation saved!');
        loadUserActivities();
        updateUserStats();
    } catch (error) {
        console.error('Error saving profit:', error);
        alert('❌ Error saving. Check your internet connection.');
    }
};

// Save Loan Calculation
window.saveLoanCalculation = async function() {
    if (!currentUser) {
        alert('Please login first');
        return;
    }
    
    const amount = parseFloat(document.getElementById('dashboardLoanAmount').value) || 0;
    const rate = parseFloat(document.getElementById('dashboardInterestRate').value) || 0;
    const months = parseFloat(document.getElementById('dashboardLoanMonths').value) || 1;
    
    let monthlyPayment = 0;
    if (amount > 0 && months > 0) {
        const monthlyRate = rate / 100;
        if (monthlyRate === 0) {
            monthlyPayment = amount / months;
        } else {
            monthlyPayment = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
        }
    }
    const totalPayment = monthlyPayment * months;
    
    const calculationData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        type: 'loan',
        data: { amount, rate, months, monthlyPayment, totalPayment },
        result: `Amount: TZS ${amount.toLocaleString()}, Monthly: TZS ${Math.round(monthlyPayment).toLocaleString()}, Total: TZS ${Math.round(totalPayment).toLocaleString()}`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection('calculations').add(calculationData);
        
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        const currentCount = userDoc.data()?.totalCalculations || 0;
        const currentLoanCount = userDoc.data()?.totalLoans || 0;
        
        await userRef.update({ 
            totalCalculations: currentCount + 1,
            totalLoans: currentLoanCount + 1
        });
        
        alert('✓ Loan calculation saved!');
        loadUserActivities();
        updateUserStats();
    } catch (error) {
        console.error('Error saving loan:', error);
        alert('❌ Error saving. Check your internet connection.');
    }
};

// Load user's activities
async function loadUserActivities() {
    if (!currentUser) return;
    
    const activitiesDiv = document.getElementById('activitiesList');
    activitiesDiv.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div>';
    
    try {
        const snapshot = await db.collection('calculations')
            .where('userId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();
        
        if (snapshot.empty) {
            activitiesDiv.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No activities yet. Start calculating!</p></div>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const calc = doc.data();
            let dateStr = 'Date unavailable';
            if (calc.timestamp) {
                const date = calc.timestamp.toDate();
                dateStr = date.toLocaleString('en-US', { 
                    month: 'short', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            }
            
            const typeIcon = calc.type === 'profit' ? '📊' : '🏦';
            const typeName = calc.type === 'profit' ? 'Profit/Loss' : 'Loan';
            
            html += `
                <div class="activity-item">
                    <div class="activity-date">${typeIcon} ${dateStr}</div>
                    <div class="activity-type">${typeName}</div>
                    <div class="activity-detail">${calc.result}</div>
                </div>
            `;
        });
        activitiesDiv.innerHTML = html;
    } catch (error) {
        console.error('Error loading activities:', error);
        activitiesDiv.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading activities</p></div>';
    }
}

// Update user stats
async function updateUserStats() {
    if (!currentUser) return;
    
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        document.getElementById('totalCalculations').innerText = userData?.totalCalculations || 0;
        document.getElementById('totalProfit').innerText = `TZS ${(userData?.totalProfit || 0).toLocaleString()}`;
        document.getElementById('totalLoans').innerText = userData?.totalLoans || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load user info
async function loadUserInfo() {
    if (!currentUser) return;
    
    const displayName = currentUser.displayName || currentUser.email.split('@')[0];
    document.getElementById('userName').innerText = displayName;
}

// ==================== AUTH STATE LISTENER ====================
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            await userRef.set({
                fullName: user.displayName || user.email.split('@')[0],
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                totalCalculations: 0,
                totalProfit: 0,
                totalLoans: 0,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await userRef.update({ lastLogin: firebase.firestore.FieldValue.serverTimestamp() });
        }
        
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        
        await loadUserInfo();
        await loadUserActivities();
        await updateUserStats();
        
        updateDashboardProfit();
        updateDashboardLoan();
        
        const mapatoInput = document.getElementById('dashboardMapato');
        const gharamaInput = document.getElementById('dashboardGharama');
        const loanAmountInput = document.getElementById('dashboardLoanAmount');
        const interestRateInput = document.getElementById('dashboardInterestRate');
        const loanMonthsInput = document.getElementById('dashboardLoanMonths');
        
        if (mapatoInput) mapatoInput.addEventListener('input', updateDashboardProfit);
        if (gharamaInput) gharamaInput.addEventListener('input', updateDashboardProfit);
        if (loanAmountInput) loanAmountInput.addEventListener('input', updateDashboardLoan);
        if (interestRateInput) interestRateInput.addEventListener('input', updateDashboardLoan);
        if (loanMonthsInput) loanMonthsInput.addEventListener('input', updateDashboardLoan);
        
    } else {
        currentUser = null;
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('dashboardSection').style.display = 'none';
        
        showLogin();
    }
});

setTimeout(() => {
    if (document.getElementById('dashboardMapato')) {
        updateDashboardProfit();
        updateDashboardLoan();
    }
}, 100);