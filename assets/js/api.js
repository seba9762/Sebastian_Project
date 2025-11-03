/**
 * API Module - Supabase helper functions and utilities
 * Centralized API calls and data formatting
 */

// Supabase configuration
let SUPABASE_URL = null;
let SUPABASE_ANON_KEY = null;

/**
 * Initialize API with Supabase credentials
 */
export function initAPI(url, key) {
    SUPABASE_URL = url;
    SUPABASE_ANON_KEY = key;
    console.log('✅ API initialized');
}

/**
 * Call Supabase RPC function
 */
export async function callSupabaseFunction(functionName, params = {}) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Supabase not initialized. Call initAPI first.');
    }
    
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_KEY') {
        throw new Error('Please configure your Supabase credentials');
    }
    
    console.log(`🔄 Calling ${functionName}`, params);
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(params)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`✅ ${functionName} completed`, data);
        return data;
    } catch (error) {
        console.error(`❌ ${functionName} failed:`, error);
        throw error;
    }
}

/**
 * Format date safely
 */
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
        console.warn('Invalid date:', dateString);
        return fallback;
    }
}

/**
 * Format date for relative time (e.g., "2 hours ago")
 */
export function formatRelativeDate(dateString, fallback = 'Never') {
    if (!dateString) return fallback;
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return fallback;
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 30) return `${diffDays}d ago`;
        
        return formatDate(dateString);
    } catch (error) {
        console.warn('Invalid date:', dateString);
        return fallback;
    }
}

/**
 * Format number with commas
 */
export function formatNumber(num, fallback = '0') {
    if (num === null || num === undefined || isNaN(num)) return fallback;
    return Number(num).toLocaleString();
}

/**
 * Show error message
 */
export function showError(message) {
    const alertArea = document.getElementById('alertArea');
    if (!alertArea) {
        alert(message);
        return;
    }
    
    alertArea.innerHTML = `
        <div class="alert alert-error">
            <span class="alert-icon">❌</span>
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        alertArea.innerHTML = '';
    }, 5000);
}

/**
 * Show success message
 */
export function showSuccess(message) {
    const alertArea = document.getElementById('alertArea');
    if (!alertArea) return;
    
    alertArea.innerHTML = `
        <div class="alert alert-success">
            <span class="alert-icon">✅</span>
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        alertArea.innerHTML = '';
    }, 3000);
}

/**
 * Show loading state
 */
export function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            Loading...
        </div>
    `;
}

/**
 * Hide loading state
 */
export function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = '';
}

/**
 * Get difficulty badge HTML
 */
export function getDifficultyBadge(difficulty) {
    const normalized = String(difficulty).toLowerCase();
    
    if (normalized === 'easy' || normalized === 'low') {
        return '<span class="badge badge-easy">Easy</span>';
    } else if (normalized === 'moderate' || normalized === 'medium' || normalized === 'moderate') {
        return '<span class="badge badge-moderate">Moderate</span>';
    } else if (normalized === 'hard' || normalized === 'high') {
        return '<span class="badge badge-hard">Hard</span>';
    }
    
    return `<span class="badge badge-secondary">${difficulty}</span>`;
}

/**
 * Get severity badge HTML
 */
export function getSeverityBadge(severity) {
    const normalized = String(severity).toLowerCase();
    
    if (normalized === 'minor' || normalized === 'low') {
        return '<span class="badge badge-minor">Minor</span>';
    } else if (normalized === 'major' || normalized === 'moderate') {
        return '<span class="badge badge-major">Major</span>';
    } else if (normalized === 'critical' || normalized === 'high') {
        return '<span class="badge badge-critical">Critical</span>';
    }
    
    return `<span class="badge badge-secondary">${severity}</span>`;
}

/**
 * Safe number parsing
 */
export function parseNumber(value, defaultValue = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safe integer parsing
 */
export function parseInt(value, defaultValue = 0) {
    const parsed = Number.parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Create chart with default options
 */
export function createChart(canvasId, type, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return null;
    }
    
    const ctx = canvas.getContext('2d');
    
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: type !== 'bar',
                position: 'top'
            },
            tooltip: {
                enabled: true
            }
        }
    };
    
    return new Chart(ctx, {
        type,
        data,
        options: { ...defaultOptions, ...options }
    });
}

/**
 * Destroy existing chart if present
 */
export function destroyChart(chartInstance) {
    if (chartInstance) {
        chartInstance.destroy();
    }
}

/**
 * Create empty state HTML
 */
export function createEmptyState(icon, title, subtitle) {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-text">${title}</div>
            <div class="empty-state-subtext">${subtitle}</div>
        </div>
    `;
}

/**
 * Export functions for dashboard and user detail pages
 */
export const api = {
    initAPI,
    callSupabaseFunction,
    formatDate,
    formatRelativeDate,
    formatNumber,
    showError,
    showSuccess,
    showLoading,
    hideLoading,
    getDifficultyBadge,
    getSeverityBadge,
    parseNumber,
    parseInt,
    createChart,
    destroyChart,
    createEmptyState
};
