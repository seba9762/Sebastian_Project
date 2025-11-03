/**
 * Dashboard JavaScript - Main admin dashboard logic
 * Loads data from Supabase and renders charts
 */

import {
    initAPI,
    callSupabaseFunction,
    formatNumber,
    formatRelativeDate,
    showError,
    showSuccess,
    createChart,
    getDifficultyBadge,
    createEmptyState
} from './api.js';

let charts = {};

/**
 * Initialize dashboard
 */
export async function initDashboard(supabaseUrl, supabaseKey) {
    console.log('🚀 Initializing dashboard...');
    
    initAPI(supabaseUrl, supabaseKey);
    
    setupEventListeners();
    
    await loadAllData();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const refreshBtn = document.getElementById('refreshBtn');
    const testBtn = document.getElementById('testBtn');
    const printBtn = document.getElementById('printBtn');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.disabled = true;
            refreshBtn.textContent = '🔄 Loading...';
            await loadAllData();
            refreshBtn.disabled = false;
            refreshBtn.textContent = '🔄 Refresh Data';
        });
    }
    
    if (testBtn) {
        testBtn.addEventListener('click', async () => {
            try {
                await callSupabaseFunction('get_dashboard_stats');
                showSuccess('Connection successful!');
            } catch (error) {
                showError(`Connection failed: ${error.message}`);
            }
        });
    }
    
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

/**
 * Load all dashboard data
 */
async function loadAllData() {
    try {
        await Promise.all([
            loadOverviewStats(),
            loadDailyActivity(),
            loadExerciseAccuracy(),
            loadTopPerformers(),
            loadDifficultWords(),
            loadRecentActivity()
        ]);
        
        showSuccess('Dashboard loaded successfully!');
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError(`Failed to load dashboard: ${error.message}`);
    }
}

/**
 * Load overview statistics
 */
async function loadOverviewStats() {
    try {
        const data = await callSupabaseFunction('get_dashboard_stats');
        
        if (!data || data.length === 0) {
            console.warn('No dashboard stats available');
            return;
        }
        
        const stats = data[0] || data;
        
        document.getElementById('totalUsers').textContent = formatNumber(stats.total_users || 0);
        document.getElementById('activeUsers').textContent = formatNumber(stats.active_users || 0);
        document.getElementById('wordsToday').textContent = formatNumber(stats.words_today || 0);
        document.getElementById('responseRate').textContent = 
            `${(stats.response_rate || 0).toFixed(1)}%`;
    } catch (error) {
        console.error('Error loading overview stats:', error);
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('activeUsers').textContent = '0';
        document.getElementById('wordsToday').textContent = '0';
        document.getElementById('responseRate').textContent = '0%';
    }
}

/**
 * Load daily activity chart
 */
async function loadDailyActivity() {
    try {
        const data = await callSupabaseFunction('get_daily_activity', { days: 7 });
        
        if (!data || data.length === 0) {
            console.warn('No daily activity data');
            return;
        }
        
        const labels = data.map(d => {
            const date = new Date(d.activity_date || d.date);
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        });
        
        const sessions = data.map(d => d.session_count || d.sessions || 0);
        const words = data.map(d => d.words_taught || d.words || 0);
        
        if (charts.activityChart) {
            charts.activityChart.destroy();
        }
        
        charts.activityChart = createChart('activityChart', 'line', {
            labels,
            datasets: [
                {
                    label: 'Sessions',
                    data: sessions,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Words Taught',
                    data: words,
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4
                }
            ]
        }, {
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        });
    } catch (error) {
        console.error('Error loading daily activity:', error);
    }
}

/**
 * Load exercise accuracy chart
 */
async function loadExerciseAccuracy() {
    try {
        const data = await callSupabaseFunction('get_exercise_accuracy', { days: 7 });
        
        if (!data || data.length === 0) {
            console.warn('No exercise accuracy data');
            return;
        }
        
        const labels = data.map(d => {
            const date = new Date(d.activity_date || d.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
        
        const accuracy = data.map(d => (d.accuracy_rate || d.accuracy || 0));
        
        if (charts.accuracyChart) {
            charts.accuracyChart.destroy();
        }
        
        charts.accuracyChart = createChart('accuracyChart', 'line', {
            labels,
            datasets: [{
                label: 'Accuracy Rate (%)',
                data: accuracy,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                tension: 0.4,
                fill: true
            }]
        }, {
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: (value) => value + '%'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading exercise accuracy:', error);
    }
}

/**
 * Load top performers chart
 */
async function loadTopPerformers() {
    try {
        const data = await callSupabaseFunction('get_top_performers');
        
        if (!data || data.length === 0) {
            console.warn('No top performers data');
            return;
        }
        
        const top10 = data.slice(0, 10);
        const labels = top10.map(d => d.user_name || d.username || `User ${d.user_id?.substring(0, 8)}`);
        const words = top10.map(d => d.words_learned || d.total_words || 0);
        
        if (charts.performersChart) {
            charts.performersChart.destroy();
        }
        
        charts.performersChart = createChart('performersChart', 'bar', {
            labels,
            datasets: [{
                label: 'Words Learned',
                data: words,
                backgroundColor: '#667eea',
                borderColor: '#5568d3',
                borderWidth: 1
            }]
        }, {
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        });
    } catch (error) {
        console.error('Error loading top performers:', error);
    }
}

/**
 * Load difficult words table
 */
async function loadDifficultWords() {
    try {
        const data = await callSupabaseFunction('get_difficult_words', { limit: 10 });
        
        const tbody = document.getElementById('difficultWordsTable');
        if (!tbody) return;
        
        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">No difficult words data available</td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = data.map(word => `
            <tr>
                <td><strong>${word.german_word || word.word || 'N/A'}</strong></td>
                <td>${word.english_translation || word.translation || 'N/A'}</td>
                <td>${word.category || word.word_category || 'N/A'}</td>
                <td>${formatNumber(word.times_taught || word.attempts || 0)}</td>
                <td>${(word.error_rate || 0).toFixed(1)}%</td>
                <td>${getDifficultyBadge(word.difficulty || 'moderate')}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading difficult words:', error);
        const tbody = document.getElementById('difficultWordsTable');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">Error loading data</td>
                </tr>
            `;
        }
    }
}

/**
 * Load recent activity feed
 */
async function loadRecentActivity() {
    try {
        const data = await callSupabaseFunction('get_recent_activity', { limit: 20 });
        
        const feed = document.getElementById('recentActivityFeed');
        if (!feed) return;
        
        if (!data || data.length === 0) {
            feed.innerHTML = createEmptyState('📭', 'No Recent Activity', 'No activity recorded yet');
            return;
        }
        
        feed.innerHTML = data.map(activity => {
            const icon = getActivityIcon(activity.activity_type || activity.type);
            const username = activity.user_name || activity.username || `User ${activity.user_id?.substring(0, 8)}`;
            const timeAgo = formatRelativeDate(activity.created_at || activity.timestamp);
            
            return `
                <div class="activity-item">
                    <div class="activity-icon">${icon}</div>
                    <div class="activity-content">
                        <div class="activity-text">
                            <strong>${username}</strong> ${activity.description || activity.activity || 'performed an action'}
                        </div>
                        <div class="activity-meta">${timeAgo}</div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading recent activity:', error);
        const feed = document.getElementById('recentActivityFeed');
        if (feed) {
            feed.innerHTML = '<div class="text-center text-danger">Error loading activity</div>';
        }
    }
}

/**
 * Get activity icon based on type
 */
function getActivityIcon(type) {
    const icons = {
        'session': '📚',
        'word_learned': '✅',
        'mistake': '❌',
        'exercise': '📝',
        'achievement': '🏆',
        'login': '🔑',
        'default': '📌'
    };
    
    return icons[type] || icons.default;
}

export { loadAllData };
