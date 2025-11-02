// Supabase API Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';

// Debug logging
let debugVisible = false;

export function toggleDebug() {
    debugVisible = !debugVisible;
    const debugCard = document.getElementById('debugCard');
    if (debugCard) {
        debugCard.classList.toggle('hidden');
    }
}

export function logDebug(message, data = null) {
    const debugOutput = document.getElementById('debugOutput');
    if (!debugOutput) return;
    
    const timestamp = new Date().toLocaleTimeString();
    let logEntry = `[${timestamp}] ${message}`;
    
    if (data !== null) {
        logEntry += '\n' + JSON.stringify(data, null, 2);
    }
    
    debugOutput.textContent += logEntry + '\n\n';
    debugOutput.scrollTop = debugOutput.scrollHeight;
    console.log(message, data);
}

// Alert management
export function showAlert(message, type = 'info') {
    const alertArea = document.getElementById('alertArea');
    if (!alertArea) return;
    
    const icons = {
        warning: '⚠️',
        error: '❌',
        success: '✅',
        info: 'ℹ️'
    };
    
    alertArea.innerHTML = `
        <div class="alert alert-${type}">
            <span class="alert-icon">${icons[type] || 'ℹ️'}</span>
            ${message}
        </div>
    `;
}

// Test Supabase connection
export async function testConnection() {
    logDebug('Testing Supabase connection...');
    
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_KEY === 'YOUR_SUPABASE_KEY') {
        showAlert('⚠️ Please configure your Supabase credentials in assets/js/api.js', 'error');
        logDebug('ERROR: Credentials not configured');
        return false;
    }
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=count`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'count=exact'
            }
        });
        
        if (response.ok) {
            const count = response.headers.get('content-range');
            showAlert(`✅ Connection successful! ${count ? 'Found ' + count.split('/')[1] + ' users.' : ''}`, 'success');
            logDebug('Connection test passed', { status: response.status });
            return true;
        } else {
            throw new Error(`${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        showAlert(`❌ Connection failed: ${error.message}`, 'error');
        logDebug('Connection test failed', error);
        return false;
    }
}

// Call Supabase function
export async function callFunction(functionName) {
    logDebug(`Calling function: ${functionName}`);
    
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_KEY === 'YOUR_SUPABASE_KEY') {
        return null;
    }
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        logDebug(`✓ ${functionName} returned:`, data);
        return data;
    } catch (error) {
        logDebug(`✗ ${functionName} failed: ${error.message}`);
        return null;
    }
}

// Fetch all dashboard data
export async function fetchDashboardData() {
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_KEY === 'YOUR_SUPABASE_KEY') {
        showAlert('⚠️ Please configure your Supabase credentials in assets/js/api.js', 'error');
        return null;
    }
    
    try {
        logDebug('=== Starting data load ===');
        
        const [
            stats,
            userProgress,
            dailyActivity,
            difficulty,
            exerciseAccuracy,
            difficultWords,
            systemSummary,
            recentActivity
        ] = await Promise.all([
            callFunction('get_dashboard_stats'),
            callFunction('get_user_progress_summary'),
            callFunction('get_daily_activity'),
            callFunction('get_difficulty_distribution'),
            callFunction('get_exercise_accuracy'),
            callFunction('get_difficult_words'),
            callFunction('get_all_sessions_summary'),
            callFunction('get_recent_activity')
        ]);
        
        logDebug('=== Data load complete ===');
        
        return {
            stats,
            userProgress,
            dailyActivity,
            difficulty,
            exerciseAccuracy,
            difficultWords,
            systemSummary,
            recentActivity
        };
    } catch (error) {
        console.error('Error loading data:', error);
        showAlert(`❌ Error: ${error.message}`, 'error');
        logDebug('FATAL ERROR', error);
        return null;
    }
}

// Export functions for CSV
export function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showAlert('No data to export', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') 
                ? `"${value}"` 
                : value;
        }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showAlert('✅ Data exported successfully!', 'success');
}

// Print dashboard
export function printDashboard() {
    window.print();
}
