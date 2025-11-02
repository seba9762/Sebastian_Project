let supabaseUrl = '';
let supabaseKey = '';

export function initSupabase(url, key) {
    supabaseUrl = url;
    supabaseKey = key;
    console.log('[API] Supabase initialized', { url: url?.substring(0, 30) + '...' });
}

export async function callSupabaseFunction(functionName, params = {}) {
    if (!supabaseUrl || !supabaseKey) {
        const error = 'Supabase credentials not set. Please configure SUPABASE_URL and SUPABASE_ANON_KEY.';
        console.error('[API Error]', error);
        throw new Error(error);
    }

    const url = `${supabaseUrl}/rest/v1/rpc/${functionName}`;
    
    console.log(`[API] Calling ${functionName}`, params);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API Error] ${functionName} failed:`, {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`RPC call failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`[API Success] ${functionName}:`, data);
        return data;
    } catch (error) {
        console.error(`[API Error] ${functionName}:`, error);
        throw error;
    }
}

export function formatDate(dateString, fallback = 'N/A') {
    if (!dateString) return fallback;
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return fallback;
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    } catch (error) {
        console.error('[formatDate] Error:', error);
        return fallback;
    }
}

export function formatDateTime(dateString, fallback = 'N/A') {
    if (!dateString) return fallback;
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return fallback;
        return date.toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('[formatDateTime] Error:', error);
        return fallback;
    }
}

export function formatRelativeTime(dateString, fallback = 'N/A') {
    if (!dateString) return fallback;
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return fallback;
        
        const now = Date.now();
        const diff = now - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    } catch (error) {
        console.error('[formatRelativeTime] Error:', error);
        return fallback;
    }
}

export function formatNumber(value, decimals = 0, fallback = '0') {
    if (value == null || isNaN(value)) return fallback;
    return Number(value).toFixed(decimals);
}

export function formatPercentage(value, decimals = 1) {
    if (value == null || isNaN(value)) return '0%';
    return `${Number(value).toFixed(decimals)}%`;
}

export function showError(message) {
    const alertArea = document.getElementById('alertArea');
    if (alertArea) {
        alertArea.innerHTML = `
            <div class="alert alert-error">
                <span class="alert-icon">❌</span>
                ${message}
            </div>
        `;
    } else {
        alert(message);
    }
}

export function showSuccess(message) {
    const alertArea = document.getElementById('alertArea');
    if (alertArea) {
        alertArea.innerHTML = `
            <div class="alert alert-success">
                <span class="alert-icon">✅</span>
                ${message}
            </div>
        `;
        setTimeout(() => {
            alertArea.innerHTML = '';
        }, 5000);
    }
}

export function showInfo(message) {
    const alertArea = document.getElementById('alertArea');
    if (alertArea) {
        alertArea.innerHTML = `
            <div class="alert alert-info">
                <span class="alert-icon">ℹ️</span>
                ${message}
            </div>
        `;
    }
}

export function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading">
                <span class="spinner"></span>
                ${message}
            </div>
        `;
    }
}

export function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

export function safeParseDate(dateString) {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    } catch (error) {
        return null;
    }
}

export function normalizeArray(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return [data];
}

export function getDifficultyBadgeClass(difficulty) {
    if (!difficulty) return 'badge-info';
    const d = difficulty.toLowerCase();
    if (d === 'easy' || d === 'low') return 'badge-easy';
    if (d === 'medium' || d === 'moderate') return 'badge-medium';
    if (d === 'hard' || d === 'high') return 'badge-hard';
    return 'badge-info';
}

export function getSeverityBadgeClass(severity) {
    if (!severity) return 'badge-info';
    const s = severity.toLowerCase();
    if (s === 'low' || s === 'minor') return 'badge-low';
    if (s === 'moderate' || s === 'medium') return 'badge-moderate';
    if (s === 'high' || s === 'severe' || s === 'critical') return 'badge-high';
    return 'badge-info';
}
