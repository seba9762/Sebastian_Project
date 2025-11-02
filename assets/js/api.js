/**
 * API Module - Centralized Supabase RPC and utility functions
 */

// Supabase configuration (to be set from main HTML)
let SUPABASE_CONFIG = {
    url: null,
    key: null
};

/**
 * Initialize the API module with Supabase credentials
 */
export function initAPI(url, key) {
    SUPABASE_CONFIG.url = url;
    SUPABASE_CONFIG.key = key;
    log('API initialized', { url: url.substring(0, 30) + '...' });
}

/**
 * Structured logging utility
 */
export function log(message, data = null, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        data
    };
    
    // Console logging with colors
    const styles = {
        info: 'color: #17a2b8',
        success: 'color: #28a745',
        warning: 'color: #ffc107',
        error: 'color: #dc3545'
    };
    
    console.log(`%c[${timestamp}] ${level.toUpperCase()}: ${message}`, styles[level] || '', data || '');
    
    return logEntry;
}

/**
 * Centralized error handler
 */
export function handleError(error, context = '') {
    const errorMsg = error.message || String(error);
    log(`Error in ${context}: ${errorMsg}`, error, 'error');
    
    return {
        success: false,
        error: errorMsg,
        context
    };
}

/**
 * Display user-facing alert
 */
export function showAlert(message, type = 'info') {
    const alertArea = document.getElementById('alertArea');
    if (!alertArea) {
        log('Alert area not found, showing console message', { message, type }, 'warning');
        alert(message);
        return;
    }
    
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
    
    // Auto-dismiss success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            alertArea.innerHTML = '';
        }, 5000);
    }
}

/**
 * Show/hide loading spinner
 */
export function setLoading(elementId, isLoading) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (isLoading) {
        element.innerHTML = '<div class="loading">Loading data...</div>';
    }
}

/**
 * Safely parse numeric value
 */
export function parseNumber(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') return defaultValue;
    const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safely parse integer value
 */
export function parseInt(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') return defaultValue;
    const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
    return isNaN(parsed) ? defaultValue : Math.floor(parsed);
}

/**
 * Safely format date with fallback
 */
export function formatDate(dateString, fallback = 'No data') {
    if (!dateString || dateString === 'Invalid Date') return fallback;
    
    try {
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            log(`Invalid date: ${dateString}`, null, 'warning');
            return fallback;
        }
        
        return date.toISOString();
    } catch (error) {
        log(`Error formatting date: ${dateString}`, error, 'error');
        return fallback;
    }
}

/**
 * Format date for display (relative time)
 */
export function formatRelativeDate(dateString, fallback = 'Never') {
    if (!dateString) return fallback;
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return fallback;
        
        const now = new Date();
        const diffMins = Math.floor((now - date) / (1000 * 60));
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    } catch (error) {
        log(`Error formatting relative date: ${dateString}`, error, 'warning');
        return fallback;
    }
}

/**
 * Format date for chart labels
 */
export function formatChartDate(dateString, format = 'short') {
    if (!dateString) return 'No data';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid';
        
        if (format === 'short') {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else if (format === 'medium') {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        return date.toLocaleDateString();
    } catch (error) {
        log(`Error formatting chart date: ${dateString}`, error, 'warning');
        return 'Invalid';
    }
}

/**
 * Normalize response data - handle both single objects and arrays
 */
export function normalizeResponse(data) {
    if (!data) return null;
    
    // If it's an array with one element, return the element
    if (Array.isArray(data) && data.length === 1) {
        return data[0];
    }
    
    // If it's an empty array, return null
    if (Array.isArray(data) && data.length === 0) {
        return null;
    }
    
    return data;
}

/**
 * Validate array response
 */
export function validateArray(data, context = '') {
    if (!Array.isArray(data)) {
        log(`Expected array in ${context}, got ${typeof data}`, data, 'warning');
        return [];
    }
    return data;
}

/**
 * Reusable Supabase RPC helper
 */
export async function callRPC(functionName, params = {}) {
    log(`Calling RPC: ${functionName}`, params);
    
    // Validate configuration
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) {
        const error = 'Supabase not configured';
        log(error, null, 'error');
        showAlert('⚠️ Please configure your Supabase credentials!', 'error');
        throw new Error(error);
    }
    
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' || SUPABASE_CONFIG.key === 'YOUR_SUPABASE_KEY') {
        const error = 'Supabase credentials not set';
        log(error, null, 'error');
        showAlert('⚠️ Please configure your Supabase credentials in the HTML file!', 'error');
        throw new Error(error);
    }
    
    try {
        const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/rpc/${functionName}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_CONFIG.key,
                'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
        }
        
        const data = await response.json();
        log(`✓ ${functionName} succeeded`, { 
            rowCount: Array.isArray(data) ? data.length : 1,
            sample: Array.isArray(data) ? data[0] : data 
        }, 'success');
        
        return {
            success: true,
            data,
            functionName
        };
        
    } catch (error) {
        log(`✗ ${functionName} failed`, error, 'error');
        showAlert(`❌ API Error: ${functionName} - ${error.message}`, 'error');
        
        return {
            success: false,
            error: error.message,
            functionName
        };
    }
}

/**
 * Test Supabase connection
 */
export async function testConnection() {
    log('Testing Supabase connection...');
    
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) {
        showAlert('⚠️ Please configure your Supabase credentials!', 'error');
        return false;
    }
    
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' || SUPABASE_CONFIG.key === 'YOUR_SUPABASE_KEY') {
        showAlert('⚠️ Please configure your Supabase credentials in the HTML file!', 'error');
        return false;
    }
    
    try {
        const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/users?select=count`, {
            headers: {
                'apikey': SUPABASE_CONFIG.key,
                'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
                'Prefer': 'count=exact'
            }
        });
        
        if (response.ok) {
            const count = response.headers.get('content-range');
            const message = `✅ Connection successful!${count ? ' Found ' + count.split('/')[1] + ' users.' : ''}`;
            showAlert(message, 'success');
            log('Connection test passed', { status: response.status }, 'success');
            return true;
        } else {
            throw new Error(`${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        showAlert(`❌ Connection failed: ${error.message}`, 'error');
        log('Connection test failed', error, 'error');
        return false;
    }
}

/**
 * Trigger print dialog for dashboard export
 */
export function printDashboard() {
    log('Triggering print dialog...');
    try {
        window.print();
        log('Print dialog opened', null, 'success');
    } catch (error) {
        log('Failed to open print dialog', error, 'error');
        showAlert('❌ Failed to open print dialog', 'error');
    }
}
