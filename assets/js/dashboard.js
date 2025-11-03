/**
 * Dashboard Module - Data loading, rendering, and visualization
 */

import { 
    callRPC, 
    log, 
    showAlert, 
    normalizeResponse, 
    validateArray, 
    parseNumber, 
    parseInt as parseIntSafe,
    formatRelativeDate,
    formatChartDate,
    printDashboard,
    testConnection,
    initAPI
} from './api.js';

// Chart instances
let charts = {
    activity: null,
    difficulty: null,
    exercise: null,
    performers: null
};

// Debug state
let debugVisible = false;

/**
 * Initialize dashboard
 */
export function initDashboard(supabaseUrl, supabaseKey) {
    log('Initializing dashboard...');
    
    // Initialize API module
    initAPI(supabaseUrl, supabaseKey);
    
    // Initialize charts
    initCharts();
    
    // Setup event handlers
    setupEventHandlers();
    
    // Load initial data
    loadDashboardData();
    
    // Setup auto-refresh (every 5 minutes)
    setInterval(loadDashboardData, 300000);
    
    log('Dashboard initialized', null, 'success');
}

/**
 * Setup event handlers
 */
function setupEventHandlers() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadDashboardData);
    }
    
    // Debug toggle button
    const debugBtn = document.getElementById('debugBtn');
    if (debugBtn) {
        debugBtn.addEventListener('click', toggleDebug);
    }
    
    // Test connection button
    const testBtn = document.getElementById('testBtn');
    if (testBtn) {
        testBtn.addEventListener('click', testConnection);
    }
    
    // Print/Export button
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', printDashboard);
    }
}

/**
 * Toggle debug panel
 */
function toggleDebug() {
    debugVisible = !debugVisible;
    const debugCard = document.getElementById('debugCard');
    if (debugCard) {
        debugCard.classList.toggle('hidden');
    }
}

/**
 * Initialize all Chart.js visualizations
 */
function initCharts() {
    log('Initializing charts...');
    
    // Activity Chart
    const activityCtx = document.getElementById('activityChart')?.getContext('2d');
    if (activityCtx) {
        charts.activity = new Chart(activityCtx, {
            type: 'line',
            data: {
                labels: ['No data'],
                datasets: [{
                    label: 'Messages Sent',
                    data: [0],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'User Responses',
                    data: [0],
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { 
                    legend: { 
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: { 
                    y: { 
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    } 
                }
            }
        });
    }
    
    // Difficulty Distribution Chart
    const difficultyCtx = document.getElementById('difficultyChart')?.getContext('2d');
    if (difficultyCtx) {
        charts.difficulty = new Chart(difficultyCtx, {
            type: 'doughnut',
            data: {
                labels: ['No data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e0e0e0']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { 
                    legend: { 
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8
                    }
                }
            }
        });
    }
    
    // Exercise Accuracy Chart
    const exerciseCtx = document.getElementById('exerciseChart')?.getContext('2d');
    if (exerciseCtx) {
        charts.exercise = new Chart(exerciseCtx, {
            type: 'line',
            data: {
                labels: ['No data'],
                datasets: [{
                    label: 'Completion Rate %',
                    data: [0],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { 
                    legend: { 
                        display: false 
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `Completion Rate: ${context.parsed.y.toFixed(1)}%`;
                            }
                        }
                    }
                },
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    } 
                }
            }
        });
    }
    
    // Top Performers Chart
    const performersCtx = document.getElementById('performersChart')?.getContext('2d');
    if (performersCtx) {
        charts.performers = new Chart(performersCtx, {
            type: 'bar',
            data: {
                labels: ['No data'],
                datasets: [{
                    label: 'Words Learned',
                    data: [0],
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: { 
                    legend: { 
                        display: false 
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: { 
                    x: { 
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    } 
                }
            }
        });
    }
    
    log('Charts initialized', null, 'success');
}

/**
 * Main data loading function with async/await
 */
export async function loadDashboardData() {
    log('=== Starting dashboard data load ===');
    showAlert('🔄 Loading dashboard data...', 'info');
    
    try {
        // Load all datasets in parallel
        const [
            statsResult,
            dailyActivityResult,
            exerciseAccuracyResult,
            topPerformersResult,
            difficultWordsResult,
            recentActivityResult,
            userProgressResult,
            systemSummaryResult,
            difficultyDistResult
        ] = await Promise.all([
            callRPC('get_dashboard_stats'),
            callRPC('get_daily_activity', { days: 7 }),
            callRPC('get_exercise_accuracy', { days: 7 }),
            callRPC('get_top_performers'),
            callRPC('get_difficult_words', { limit: 10 }),
            callRPC('get_recent_activity', { limit: 20 }),
            callRPC('get_user_progress_summary'),
            callRPC('get_all_sessions_summary'),
            callRPC('get_difficulty_distribution')
        ]);
        
        // Update UI with results
        if (statsResult.success) {
            updateStats(statsResult.data);
        }
        
        if (systemSummaryResult.success) {
            updateSystemOverview(systemSummaryResult.data);
        }
        
        if (dailyActivityResult.success) {
            updateActivityChart(dailyActivityResult.data);
        }
        
        if (exerciseAccuracyResult.success) {
            updateExerciseChart(exerciseAccuracyResult.data);
        }
        
        if (difficultyDistResult.success) {
            updateDifficultyChartFromDistribution(difficultyDistResult.data);
        }
        
        if (topPerformersResult.success) {
            updatePerformersChart(topPerformersResult.data);
            loadTopPerformers(topPerformersResult.data);
        }
        
        if (userProgressResult.success) {
            updateUsersTable(userProgressResult.data);
        }
        
        if (difficultWordsResult.success) {
            updateDifficultWordsTable(difficultWordsResult.data);
        }
        
        if (recentActivityResult.success) {
            updateRecentActivityFeed(recentActivityResult.data);
        }
        
        showAlert('✅ Dashboard updated successfully!', 'success');
        log('=== Dashboard data load complete ===', null, 'success');
        
    } catch (error) {
        const errorMsg = `Failed to load dashboard data: ${error.message}`;
        log(errorMsg, error, 'error');
        showAlert(`❌ ${errorMsg}`, 'error');
    }
}

/**
 * Update stats cards
 */
function updateStats(data) {
    log('Updating stats...', data);
    
    // Normalize response (handle single object or array)
    const stats = normalizeResponse(data);
    
    if (!stats) {
        log('No stats data available', null, 'warning');
        return;
    }
    
    // Safely update each stat with coercion
    const totalUsers = parseIntSafe(stats.total_users, 0);
    const wordsToday = parseIntSafe(stats.words_today, 0);
    const responseRate = parseNumber(stats.response_rate, 0);
    const avgEngagement = parseNumber(stats.avg_engagement, 0);
    
    // Update DOM
    updateElement('totalUsers', totalUsers);
    updateElement('wordsToday', wordsToday);
    updateElement('responseRate', `${responseRate.toFixed(1)}%`);
    updateElement('avgEngagement', avgEngagement.toFixed(1));
    
    log('Stats updated', { totalUsers, wordsToday, responseRate, avgEngagement }, 'success');
}

/**
 * Update system overview section
 */
function updateSystemOverview(data) {
    log('Updating system overview...', data);
    
    // Normalize response (handle single object or array)
    const summary = normalizeResponse(data);
    
    if (!summary) {
        log('No system overview data available', null, 'warning');
        return;
    }
    
    const totalSessions = parseIntSafe(summary.total_sessions, 0);
    const sessionTypes = summary.session_types || {};
    const messagesSent = parseIntSafe(sessionTypes.learn, 0) + 
                        parseIntSafe(sessionTypes.exercise, 0) + 
                        parseIntSafe(sessionTypes.review, 0);
    const activeDays = parseIntSafe(summary.dates_with_data, 0);
    
    // Calculate system age
    if (summary.earliest_date) {
        try {
            const earliest = new Date(summary.earliest_date);
            if (!isNaN(earliest.getTime())) {
                const daysSince = Math.floor((new Date() - earliest) / (1000 * 60 * 60 * 24));
                updateElement('overviewAge', daysSince === 0 ? 'Today' : `${daysSince}d`);
            } else {
                updateElement('overviewAge', 'New');
            }
        } catch {
            updateElement('overviewAge', 'New');
        }
    } else {
        updateElement('overviewAge', 'New');
    }
    
    updateElement('overviewSessions', totalSessions);
    updateElement('overviewMessages', messagesSent);
    updateElement('overviewResponses', activeDays);
    
    log('System overview updated', { totalSessions, messagesSent, activeDays }, 'success');
}

/**
 * Update activity chart
 */
function updateActivityChart(data) {
    log('Updating activity chart...', data);
    
    if (!charts.activity) {
        log('Activity chart not initialized', null, 'warning');
        return;
    }
    
    const activities = validateArray(data, 'activity chart');
    
    if (activities.length === 0) {
        charts.activity.data.labels = ['No data'];
        charts.activity.data.datasets[0].data = [0];
        charts.activity.data.datasets[1].data = [0];
        charts.activity.update();
        log('Activity chart: no data available', null, 'warning');
        return;
    }
    
    // Parse and validate data
    const labels = activities.map(d => formatChartDate(d.date, 'short'));
    const messagesSent = activities.map(d => parseIntSafe(d.messages_sent, 0));
    const responsesReceived = activities.map(d => parseIntSafe(d.responses_received, 0));
    
    charts.activity.data.labels = labels;
    charts.activity.data.datasets[0].data = messagesSent;
    charts.activity.data.datasets[1].data = responsesReceived;
    charts.activity.update();
    
    log('Activity chart updated', { dataPoints: activities.length }, 'success');
}

/**
 * Update exercise accuracy chart
 */
function updateExerciseChart(data) {
    log('Updating exercise chart...', data);
    
    if (!charts.exercise) {
        log('Exercise chart not initialized', null, 'warning');
        return;
    }
    
    const exercises = validateArray(data, 'exercise chart');
    
    if (exercises.length === 0) {
        charts.exercise.data.labels = ['No data'];
        charts.exercise.data.datasets[0].data = [0];
        charts.exercise.update();
        log('Exercise chart: no data available', null, 'warning');
        return;
    }
    
    // Parse and validate data
    const labels = exercises.map(d => formatChartDate(d.date, 'short'));
    const rates = exercises.map(d => parseNumber(d.completion_rate, 0));
    
    charts.exercise.data.labels = labels;
    charts.exercise.data.datasets[0].data = rates;
    charts.exercise.update();
    
    log('Exercise chart updated', { dataPoints: exercises.length }, 'success');
}

/**
 * Update top performers chart
 */
function updatePerformersChart(data) {
    log('Updating performers chart...', data);
    
    if (!charts.performers) {
        log('Performers chart not initialized', null, 'warning');
        return;
    }
    
    const users = validateArray(data, 'performers chart');
    
    if (users.length === 0) {
        charts.performers.data.labels = ['No data'];
        charts.performers.data.datasets[0].data = [0];
        charts.performers.update();
        log('Performers chart: no data available', null, 'warning');
        return;
    }
    
    // Get top 5 performers
    const topUsers = users
        .sort((a, b) => parseIntSafe(b.words_mastered || b.words_learned, 0) - parseIntSafe(a.words_mastered || a.words_learned, 0))
        .slice(0, 5);
    
    const names = topUsers.map(u => u.name || 'Unknown');
    const wordsCount = topUsers.map(u => parseIntSafe(u.words_mastered || u.words_learned, 0));
    
    // Update difficulty chart if we have difficulty data
    if (users.length > 0 && users[0].difficulty_distribution) {
        updateDifficultyChart(users);
    }
    
    charts.performers.data.labels = names;
    charts.performers.data.datasets[0].data = wordsCount;
    charts.performers.update();
    
    log('Performers chart updated', { topUsers: topUsers.length }, 'success');
}

/**
 * Load and display top performers table with clickable rows
 */
function loadTopPerformers(data) {
    log('Loading top performers table...', data);
    
    const tbody = document.getElementById('topPerformersTableBody');
    if (!tbody) {
        log('Top performers table body not found', null, 'warning');
        return;
    }
    
    const users = validateArray(data, 'top performers table');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">No top performers data available</td></tr>';
        log('Top performers table: no data available', null, 'warning');
        return;
    }
    
    // Sort by words_mastered and take top 10
    const topUsers = users
        .sort((a, b) => parseIntSafe(b.words_mastered || b.words_learned, 0) - parseIntSafe(a.words_mastered || a.words_learned, 0))
        .slice(0, 10);
    
    tbody.innerHTML = topUsers.map(user => {
        const userId = user.user_id || '';
        const name = user.name || 'Unknown User';
        const phoneNumber = user.phone_number || '';
        const wordsMastered = parseIntSafe(user.words_mastered || user.words_learned, 0);
        const responseRate = parseNumber(user.response_rate, 0);
        const streakDays = parseIntSafe(user.streak_days || user.current_streak, 0);
        
        return `
            <tr class="clickable-row" data-user-id="${userId}">
                <td><strong>${name}</strong><br><small>${phoneNumber}</small></td>
                <td>${wordsMastered}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${responseRate}%"></div>
                    </div>
                    <small>${responseRate.toFixed(1)}%</small>
                </td>
                <td>🔥 ${streakDays} days</td>
            </tr>
        `;
    }).join('');
    
    // Add click event listeners to each row
    const rows = tbody.querySelectorAll('.clickable-row');
    rows.forEach(row => {
        row.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            if (userId) {
                window.location.href = `user-detail.html?user_id=${userId}`;
            }
        });
    });
    
    log('Top performers table updated', { userCount: topUsers.length }, 'success');
}

/**
 * Update difficulty distribution chart from user data
 */
function updateDifficultyChart(userData) {
    log('Updating difficulty chart from user data...');
    
    if (!charts.difficulty) {
        log('Difficulty chart not initialized', null, 'warning');
        return;
    }
    
    // Try to extract difficulty distribution from user data or use dummy data
    const difficultyData = [
        { difficulty: 'Easy', count: 0 },
        { difficulty: 'Medium', count: 0 },
        { difficulty: 'Hard', count: 0 }
    ];
    
    // If we have actual difficulty data, use it
    if (Array.isArray(userData) && userData.length > 0) {
        // Aggregate difficulty counts
        userData.forEach(user => {
            if (user.easy_count) difficultyData[0].count += parseIntSafe(user.easy_count, 0);
            if (user.medium_count) difficultyData[1].count += parseIntSafe(user.medium_count, 0);
            if (user.hard_count) difficultyData[2].count += parseIntSafe(user.hard_count, 0);
        });
    }
    
    const totalCount = difficultyData.reduce((sum, d) => sum + d.count, 0);
    
    if (totalCount === 0) {
        charts.difficulty.data.labels = ['No data'];
        charts.difficulty.data.datasets[0].data = [1];
        charts.difficulty.data.datasets[0].backgroundColor = ['#e0e0e0'];
        charts.difficulty.update();
        log('Difficulty chart: no data available', null, 'warning');
        return;
    }
    
    const labels = difficultyData.map(d => d.difficulty);
    const counts = difficultyData.map(d => d.count);
    
    charts.difficulty.data.labels = labels;
    charts.difficulty.data.datasets[0].data = counts;
    charts.difficulty.data.datasets[0].backgroundColor = ['#28a745', '#ffc107', '#dc3545'];
    charts.difficulty.update();
    
    log('Difficulty chart updated', { totalCount }, 'success');
}

/**
 * Update difficulty distribution chart from API data
 */
function updateDifficultyChartFromDistribution(data) {
    log('Updating difficulty chart from distribution...', data);
    
    if (!charts.difficulty) {
        log('Difficulty chart not initialized', null, 'warning');
        return;
    }
    
    const difficulties = validateArray(data, 'difficulty chart');
    
    if (difficulties.length === 0) {
        charts.difficulty.data.labels = ['No data'];
        charts.difficulty.data.datasets[0].data = [1];
        charts.difficulty.data.datasets[0].backgroundColor = ['#e0e0e0'];
        charts.difficulty.update();
        log('Difficulty chart: no data available', null, 'warning');
        return;
    }
    
    const labels = difficulties.map(d => {
        const diff = d.difficulty || '';
        return diff.charAt(0).toUpperCase() + diff.slice(1);
    });
    const counts = difficulties.map(d => parseIntSafe(d.count, 0));
    
    charts.difficulty.data.labels = labels;
    charts.difficulty.data.datasets[0].data = counts;
    charts.difficulty.data.datasets[0].backgroundColor = ['#28a745', '#ffc107', '#dc3545'];
    charts.difficulty.update();
    
    log('Difficulty chart updated', { dataPoints: difficulties.length }, 'success');
}

/**
 * Update users table
 */
function updateUsersTable(data) {
    log('Updating users table...', data);
    
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) {
        log('Users table body not found', null, 'warning');
        return;
    }
    
    const users = validateArray(data, 'users table');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No users found</td></tr>';
        log('Users table: no data available', null, 'warning');
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const name = user.name || 'N/A';
        const phoneNumber = user.phone_number || 'N/A';
        const wordsLearned = parseIntSafe(user.words_learned, 0);
        const currentStreak = parseIntSafe(user.current_streak, 0);
        const responseRate = parseNumber(user.response_rate, 0);
        const lastActive = user.last_active;
        
        return `
            <tr>
                <td><strong>${name}</strong><br><small>${phoneNumber}</small></td>
                <td>${wordsLearned}</td>
                <td>🔥 ${currentStreak} days</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${responseRate}%"></div>
                    </div>
                    <small>${responseRate.toFixed(1)}%</small>
                </td>
                <td>${formatRelativeDate(lastActive)}</td>
                <td>
                    <span class="badge ${getStatusBadge(lastActive)}">
                        ${getStatusText(lastActive)}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
    
    log('Users table updated', { userCount: users.length }, 'success');
}

/**
 * Update difficult words table
 */
function updateDifficultWordsTable(data) {
    log('Updating difficult words table...', data);
    
    const tbody = document.getElementById('difficultWordsTable');
    if (!tbody) {
        log('Difficult words table body not found', null, 'warning');
        return;
    }
    
    const words = validateArray(data, 'difficult words table');
    
    if (words.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No difficult words data yet</td></tr>';
        log('Difficult words table: no data available', null, 'warning');
        return;
    }
    
    tbody.innerHTML = words.map(word => {
        const wordText = word.word || 'N/A';
        const translation = word.translation || 'N/A';
        const timesTaught = parseIntSafe(word.times_taught, 0);
        const markedHard = parseIntSafe(word.marked_hard, 0);
        const difficultyPct = parseNumber(word.difficulty_pct, 0);
        
        const badgeClass = difficultyPct > 50 ? 'badge-danger' : 
                          difficultyPct > 30 ? 'badge-warning' : 
                          'badge-success';
        
        return `
            <tr>
                <td><strong>${wordText}</strong></td>
                <td>${translation}</td>
                <td>${timesTaught}</td>
                <td>${markedHard}</td>
                <td>
                    <span class="badge ${badgeClass}">
                        ${difficultyPct.toFixed(1)}%
                    </span>
                </td>
            </tr>
        `;
    }).join('');
    
    log('Difficult words table updated', { wordCount: words.length }, 'success');
}

/**
 * Update recent activity feed
 */
function updateRecentActivityFeed(data) {
    log('Updating recent activity feed...', data);
    
    const feed = document.getElementById('recentActivityFeed');
    if (!feed) {
        log('Recent activity feed not found (element may not exist in this dashboard)', null, 'warning');
        return;
    }
    
    const activities = validateArray(data, 'recent activity feed');
    
    if (activities.length === 0) {
        feed.innerHTML = '<div class="loading">No recent activity</div>';
        log('Recent activity feed: no data available', null, 'warning');
        return;
    }
    
    feed.innerHTML = activities.map(activity => {
        const userName = activity.user_name || 'Unknown User';
        const action = activity.action || 'performed an action';
        const timestamp = formatRelativeDate(activity.created_at);
        
        return `
            <div class="activity-item">
                <div class="activity-user">${userName}</div>
                <div class="activity-action">${action}</div>
                <div class="activity-time">${timestamp}</div>
            </div>
        `;
    }).join('');
    
    log('Recent activity feed updated', { activityCount: activities.length }, 'success');
}

/**
 * Helper: Update element text content safely
 */
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

/**
 * Helper: Get status badge class
 */
function getStatusBadge(lastActive) {
    if (!lastActive) return 'badge-danger';
    
    try {
        const date = new Date(lastActive);
        if (isNaN(date.getTime())) return 'badge-danger';
        
        const diffDays = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
        if (diffDays < 1) return 'badge-success';
        if (diffDays < 3) return 'badge-warning';
        return 'badge-danger';
    } catch {
        return 'badge-danger';
    }
}

/**
 * Helper: Get status text
 */
function getStatusText(lastActive) {
    if (!lastActive) return 'Never Active';
    
    try {
        const date = new Date(lastActive);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        const diffDays = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
        if (diffDays < 1) return 'Active Today';
        if (diffDays < 3) return 'Recent';
        return 'Inactive';
    } catch {
        return 'Error';
    }
}

// Export main functions
export { testConnection };
