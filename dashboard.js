// ==================== DASHBOARD FUNCTIONS ====================
let currentUser = null;

function getTranslation(key) {
    return translations[currentLang][key] || key;
}

function updateProfitDisplay() {
    const revenue = parseFloat(document.getElementById('dashboardMapato').value) || 0;
    const expenses = parseFloat(document.getElementById('dashboardGharama').value) || 0;
    const profit = revenue - expenses;
    const element = document.getElementById('dashboardFaidaValue');
    if (profit >= 0) {
        element.innerHTML = `TZS ${profit.toLocaleString()} (${currentLang === 'en' ? 'Profit' : 'Faida'})`;
    } else {
        element.innerHTML = `TZS ${Math.abs(profit).toLocaleString()} (${currentLang === 'en' ? 'Loss' : 'Hasara'})`;
    }
}

function updateLoanDisplay() {
    const amount = parseFloat(document.getElementById('dashboardLoanAmount').value) || 0;
    const rate = parseFloat(document.getElementById('dashboardInterestRate').value) || 0;
    const months = parseFloat(document.getElementById('dashboardLoanMonths').value) || 1;
    let monthlyPayment = 0, totalPayment = 0;
    if (amount > 0 && months > 0) {
        const monthlyRate = rate / 100;
        if (monthlyRate === 0) monthlyPayment = amount / months;
        else monthlyPayment = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
        totalPayment = monthlyPayment * months;
    }
    document.getElementById('dashboardMonthlyPayment').innerHTML = `TZS ${Math.round(monthlyPayment).toLocaleString()}`;
    const totalText = currentLang === 'en' ? 'Total Repayment' : 'Jumla ya kulipa';
    document.getElementById('dashboardTotalPayment').innerHTML = `${totalText}: TZS ${Math.round(totalPayment).toLocaleString()}`;
}

window.saveProfitCalculation = async function() {
    if (!currentUser) return alert(getTranslation('pleaseLoginFirst'));
    const revenue = parseFloat(document.getElementById('dashboardMapato').value) || 0;
    const expenses = parseFloat(document.getElementById('dashboardGharama').value) || 0;
    const profit = revenue - expenses;
    try {
        await db.collection('calculations').add({
            userId: currentUser.uid, userEmail: currentUser.email,
            userName: currentUser.displayName || currentUser.email.split('@')[0],
            type: 'profit', data: { revenue, expenses, profit },
            result: profit >= 0 ? `Profit: TZS ${profit.toLocaleString()}` : `Loss: TZS ${Math.abs(profit).toLocaleString()}`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        await userRef.update({ 
            totalCalculations: (userDoc.data()?.totalCalculations || 0) + 1,
            totalProfit: (userDoc.data()?.totalProfit || 0) + (profit > 0 ? profit : 0)
        });
        alert(getTranslation('calculationSaved'));
        loadUserActivities();
        updateUserStats();
    } catch (error) { console.error(error); alert(getTranslation('errorSaving')); }
};

window.saveLoanCalculation = async function() {
    if (!currentUser) return alert(getTranslation('pleaseLoginFirst'));
    const amount = parseFloat(document.getElementById('dashboardLoanAmount').value) || 0;
    const rate = parseFloat(document.getElementById('dashboardInterestRate').value) || 0;
    const months = parseFloat(document.getElementById('dashboardLoanMonths').value) || 1;
    let monthlyPayment = 0;
    if (amount > 0 && months > 0) {
        const monthlyRate = rate / 100;
        monthlyPayment = monthlyRate === 0 ? amount / months : amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    }
    try {
        await db.collection('calculations').add({
            userId: currentUser.uid, userEmail: currentUser.email,
            userName: currentUser.displayName || currentUser.email.split('@')[0],
            type: 'loan', data: { amount, rate, months, monthlyPayment },
            result: `Amount: TZS ${amount.toLocaleString()}, Monthly: TZS ${Math.round(monthlyPayment).toLocaleString()}`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        await userRef.update({ 
            totalCalculations: (userDoc.data()?.totalCalculations || 0) + 1,
            totalLoans: (userDoc.data()?.totalLoans || 0) + 1
        });
        alert(getTranslation('calculationSaved'));
        loadUserActivities();
        updateUserStats();
    } catch (error) { console.error(error); alert(getTranslation('errorSaving')); }
};

async function loadUserActivities() {
    if (!currentUser) return;
    const activitiesDiv = document.getElementById('activitiesList');
    activitiesDiv.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div>';
    try {
        const snapshot = await db.collection('calculations').where('userId', '==', currentUser.uid).orderBy('timestamp', 'desc').limit(20).get();
        if (snapshot.empty) {
            activitiesDiv.innerHTML = `<div class="empty-state"><i class="fas fa-folder-open"></i><p>${getTranslation('noActivities')}</p></div>`;
            return;
        }
        let html = '';
        snapshot.forEach(doc => {
            const calc = doc.data();
            const dateStr = calc.timestamp ? calc.timestamp.toDate().toLocaleString() : 'Just now';
            const typeIcon = calc.type === 'profit' ? '📊' : '🏦';
            const typeName = calc.type === 'profit' ? (currentLang === 'en' ? 'Profit/Loss' : 'Faida/Hasara') : (currentLang === 'en' ? 'Loan' : 'Mkopo');
            html += `<div class="activity-item"><div class="activity-date">${typeIcon} ${dateStr}</div><div class="activity-type">${typeName}</div><div class="activity-detail">${calc.result}</div></div>`;
        });
        activitiesDiv.innerHTML = html;
    } catch (error) {
        activitiesDiv.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>${currentLang === 'en' ? 'Error loading activities' : 'Hitilafu wakati wa kupakia shughuli'}</p></div>`;
    }
}

async function updateUserStats() {
    if (!currentUser) return;
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const data = userDoc.data();
        document.getElementById('totalCalculations').innerText = data?.totalCalculations || 0;
        document.getElementById('totalProfit').innerText = `TZS ${(data?.totalProfit || 0).toLocaleString()}`;
        document.getElementById('totalLoans').innerText = data?.totalLoans || 0;
    } catch (error) {}
}

async function loadUserInfo() {
    if (!currentUser) return;
    document.getElementById('userName').innerText = currentUser.displayName || currentUser.email.split('@')[0];
}

auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            await userRef.set({ fullName: user.displayName || user.email.split('@')[0], email: user.email, createdAt: firebase.firestore.FieldValue.serverTimestamp(), totalCalculations: 0, totalProfit: 0, totalLoans: 0, lastLogin: firebase.firestore.FieldValue.serverTimestamp() });
        } else { await userRef.update({ lastLogin: firebase.firestore.FieldValue.serverTimestamp() }); }
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        await loadUserInfo(); await loadUserActivities(); await updateUserStats();
        updateProfitDisplay(); updateLoanDisplay();
        document.getElementById('dashboardMapato').addEventListener('input', updateProfitDisplay);
        document.getElementById('dashboardGharama').addEventListener('input', updateProfitDisplay);
        document.getElementById('dashboardLoanAmount').addEventListener('input', updateLoanDisplay);
        document.getElementById('dashboardInterestRate').addEventListener('input', updateLoanDisplay);
        document.getElementById('dashboardLoanMonths').addEventListener('input', updateLoanDisplay);
    } else {
        currentUser = null;
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('dashboardSection').style.display = 'none';
        showLoginForm();
    }
});
