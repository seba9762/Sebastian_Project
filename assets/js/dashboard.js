import { fetchDashboardData, showAlert, testConnection, toggleDebug, exportToCSV, printDashboard } from './api.js';
import { initCharts, updateActivityChart, updateDifficultyChart, updateExerciseChart, updatePerformersChart } from './charts.js';

// Data storage
let currentData = null;

// Initialize dashboard
function init() {
    initCharts();
    loadData();
    
    // Auto-refresh every 5 minutes
    setInterval(loadData, 300000);
    
    // Set up event listeners
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    const refreshBtn = document.getElementById('refreshBtn');
    const debugBtn = document.getElementById('debugBtn');
    const testBtn = document.getElementById('testBtn');
    const exportBtn = document.getElementById('exportBtn');
    const printBtn = document.getElementById('printBtn');
    
    if (refreshBtn) refreshBtn.addEventListener('click', loadData);
    if (debugBtn) debugBtn.addEventListener('click', toggleDebug);
    if (testBtn) testBtn.addEventListener('click', testConnection);
    if (exportBtn) exportBtn.addEventListener('click', handleExport);
    if (printBtn) printBtn.addEventListener('click', printDashboard);
}

// Load all dashboard data
async function loadData() {
    const data = await fetchDashboardData();
    
    if (!data) return;
    
    currentData = data;
    
    // Update all sections
    if (data.stats) updateStats(data.stats);
    if (data.systemSummary) updateSystemOverview(data.systemSummary);
    if (data.userProgress) {
        updateUsersTable(data.userProgress);
        updatePerformersChart(data.userProgress);
    }
    if (data.dailyActivity) updateActivityChart(data.dailyActivity);
    if (data.difficulty) updateDifficultyChart(data.difficulty);
    if (data.exerciseAccuracy) updateExerciseChart(data.exerciseAccuracy);
    if (data.difficultWords) updateDifficultWordsTable(data.difficultWords);
    if (data.recentActivity) updateActivityFeed(data.recentActivity);
    
    showAlert('✅ Dashboard updated successfully!', 'success');
}

// Update overview statistics
function updateStats(stats) {
    const data = Array.isArray(stats) ? stats[0] : stats;
    
    const totalUsers = document.getElementById('totalUsers');
    const wordsToday = document.getElementById('wordsToday');
    const responseRate = document.getElementById('responseRate');
    const avgEngagement = document.getElementById('avgEngagement');
    
    if (totalUsers) totalUsers.textContent = data.total_users || 0;
    if (wordsToday) wordsToday.textContent = data.words_today || 0;
    if (responseRate) responseRate.textContent = `${data.response_rate || 0}%`;
    if (avgEngagement) avgEngagement.textContent = data.avg_engagement || 0;
}

// Update system overview section
function updateSystemOverview(summary) {
    const data = Array.isArray(summary) ? summary[0] : summary;
    
    if (!data) return;
    
    const totalSessions = data.total_sessions || 0;
    const sessionTypes = data.session_types || {};
    const messagesSent = (sessionTypes.learn || 0) + (sessionTypes.exercise || 0) + (sessionTypes.review || 0);
    const activeDays = data.dates_with_data || 0;
    
    const overviewSessions = document.getElementById('overviewSessions');
    const overviewMessages = document.getElementById('overviewMessages');
    const overviewResponses = document.getElementById('overviewResponses');
    const overviewAge = document.getElementById('overviewAge');
    
    if (overviewSessions) overviewSessions.textContent = totalSessions;
    if (overviewMessages) overviewMessages.textContent = messagesSent;
    if (overviewResponses) overviewResponses.textContent = activeDays;
    
    if (overviewAge && data.earliest_date) {
        const earliest = new Date(data.earliest_date);
        const daysSince = Math.floor((new Date() - earliest) / (1000 * 60 * 60 * 24));
        overviewAge.textContent = daysSince === 0 ? 'Today' : `${daysSince}d`;
    } else if (overviewAge) {
        overviewAge.textContent = 'New';
    }
}

// Update users table
function updateUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (!tbody) return;
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-loading">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>
                <a href="user-detail.html?id=${user.phone_number || ''}" class="user-link">
                    <strong>${user.name || 'N/A'}</strong>
                </a>
                <br>
                <small class="text-muted">${user.phone_number || 'N/A'}</small>
            </td>
            <td>${user.words_learned || 0}</td>
            <td>🔥 ${user.current_streak || 0} days</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${user.response_rate || 0}%"></div>
                </div>
                <small>${user.response_rate || 0}%</small>
            </td>
            <td>${formatDate(user.last_active)}</td>
            <td>
                <span class="badge ${getStatusBadge(user.last_active)}">
                    ${getStatusText(user.last_active)}
                </span>
            </td>
        </tr>
    `).join('');
}

// Update difficult words table
function updateDifficultWordsTable(words) {
    const tbody = document.getElementById('difficultWordsTable');
    
    if (!tbody) return;
    
    if (!words || words.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="table-loading">No difficult words data yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = words.map(word => `
        <tr>
            <td><strong>${word.word || 'N/A'}</strong></td>
            <td>${word.translation || 'N/A'}</td>
            <td>${word.times_taught || 0}</td>
            <td>${word.marked_hard || 0}</td>
            <td>
                <span class="badge ${getDifficultyBadge(word.difficulty_pct)}">
                    ${word.difficulty_pct || 0}%
                </span>
            </td>
        </tr>
    `).join('');
}

// Update recent activity feed
function updateActivityFeed(activities) {
    const feed = document.getElementById('activityFeed');
    
    if (!feed) return;
    
    if (!activities || activities.length === 0) {
        feed.innerHTML = '<div class="table-loading">No recent activity</div>';
        return;
    }
    
    feed.innerHTML = activities.slice(0, 10).map(activity => {
        const type = activity.session_type || 'learn';
        const icon = getActivityIcon(type);
        
        return `
            <div class="activity-item">
                <div class="activity-icon ${type}">
                    ${icon}
                </div>
                <div class="activity-content">
                    <div class="activity-user">${activity.user_name || 'Unknown User'}</div>
                    <div class="activity-action">${getActivityText(activity)}</div>
                    <div class="activity-time">${formatDate(activity.created_at)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - date) / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
}

function getStatusBadge(lastActive) {
    if (!lastActive) return 'badge-danger';
    const diffDays = Math.floor((new Date() - new Date(lastActive)) / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return 'badge-success';
    if (diffDays < 3) return 'badge-warning';
    return 'badge-danger';
}

function getStatusText(lastActive) {
    if (!lastActive) return 'Never Active';
    const diffDays = Math.floor((new Date() - new Date(lastActive)) / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return 'Active Today';
    if (diffDays < 3) return 'Recent';
    return 'Inactive';
}

function getDifficultyBadge(difficultyPct) {
    const pct = parseFloat(difficultyPct);
    if (pct > 50) return 'badge-danger';
    if (pct > 30) return 'badge-warning';
    return 'badge-success';
}

function getActivityIcon(type) {
    const icons = {
        learn: '📚',
        exercise: '✏️',
        review: '🔄'
    };
    return icons[type] || '📝';
}

function getActivityText(activity) {
    const type = activity.session_type || 'learn';
    const texts = {
        learn: 'learned new words',
        exercise: 'completed an exercise',
        review: 'reviewed vocabulary'
    };
    return texts[type] || 'had a session';
}

// Export current data
function handleExport() {
    if (!currentData || !currentData.userProgress) {
        showAlert('No data available to export', 'warning');
        return;
    }
    
    exportToCSV(currentData.userProgress, 'dashboard_users');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
