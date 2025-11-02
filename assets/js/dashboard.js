import {
    initSupabase,
    callSupabaseFunction,
    formatDate,
    formatRelativeTime,
    formatNumber,
    formatPercentage,
    showError,
    showInfo,
    showLoading,
    normalizeArray,
    getDifficultyBadgeClass
} from './api.js';

let dailyActivityChart = null;
let exerciseAccuracyChart = null;

export async function initDashboard(supabaseUrl, supabaseKey) {
    initSupabase(supabaseUrl, supabaseKey);
    
    document.getElementById('refreshBtn')?.addEventListener('click', loadDashboardData);
    document.getElementById('printBtn')?.addEventListener('click', () => window.print());
    
    await loadDashboardData();
}

async function loadDashboardData() {
    showInfo('Loading dashboard data...');
    
    try {
        await Promise.all([
            loadStats(),
            loadDailyActivity(),
            loadExerciseAccuracy(),
            loadActiveUsers(),
            loadDifficultWords(),
            loadRecentActivity()
        ]);
        
        document.getElementById('alertArea').innerHTML = '';
    } catch (error) {
        console.error('[Dashboard] Error loading data:', error);
        showError('Failed to load dashboard data. Please check your Supabase configuration.');
    }
}

async function loadStats() {
    try {
        const data = await callSupabaseFunction('get_dashboard_stats');
        const stats = Array.isArray(data) && data.length > 0 ? data[0] : data;
        
        document.getElementById('statTotalUsers').textContent = formatNumber(stats?.total_users || 0);
        document.getElementById('statWordsLearned').textContent = formatNumber(stats?.total_words_learned || 0);
        document.getElementById('statAccuracy').textContent = formatPercentage(stats?.average_accuracy || 0);
        document.getElementById('statExercises').textContent = formatNumber(stats?.total_exercises || 0);
    } catch (error) {
        console.error('[Dashboard] Error loading stats:', error);
        document.getElementById('statTotalUsers').textContent = '0';
        document.getElementById('statWordsLearned').textContent = '0';
        document.getElementById('statAccuracy').textContent = '0%';
        document.getElementById('statExercises').textContent = '0';
    }
}

async function loadDailyActivity() {
    try {
        const data = await callSupabaseFunction('get_daily_activity', { days: 7 });
        const activities = normalizeArray(data);
        
        if (activities.length === 0) {
            renderEmptyChart('dailyActivityChart', 'No activity data available');
            return;
        }
        
        const labels = activities.map(item => formatDate(item.date || item.activity_date, 'N/A'));
        const activeUsers = activities.map(item => Number(item.active_users || 0));
        const exercises = activities.map(item => Number(item.total_exercises || 0));
        
        const ctx = document.getElementById('dailyActivityChart');
        if (dailyActivityChart) {
            dailyActivityChart.destroy();
        }
        
        dailyActivityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Active Users',
                        data: activeUsers,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Exercises',
                        data: exercises,
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('[Dashboard] Error loading daily activity:', error);
        renderEmptyChart('dailyActivityChart', 'Failed to load activity data');
    }
}

async function loadExerciseAccuracy() {
    try {
        const data = await callSupabaseFunction('get_exercise_accuracy', { days: 7 });
        const accuracy = normalizeArray(data);
        
        if (accuracy.length === 0) {
            renderEmptyChart('exerciseAccuracyChart', 'No accuracy data available');
            return;
        }
        
        const labels = accuracy.map(item => formatDate(item.date || item.exercise_date, 'N/A'));
        const accuracyValues = accuracy.map(item => Number(item.accuracy || 0));
        
        const ctx = document.getElementById('exerciseAccuracyChart');
        if (exerciseAccuracyChart) {
            exerciseAccuracyChart.destroy();
        }
        
        exerciseAccuracyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Accuracy %',
                    data: accuracyValues,
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: '#28a745',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    } catch (error) {
        console.error('[Dashboard] Error loading exercise accuracy:', error);
        renderEmptyChart('exerciseAccuracyChart', 'Failed to load accuracy data');
    }
}

async function loadActiveUsers() {
    const tbody = document.getElementById('usersTableBody');
    
    try {
        const data = await callSupabaseFunction('get_top_performers');
        const users = normalizeArray(data);
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <div class="empty-state-icon">👥</div>
                            <div class="empty-state-message">No active users found</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.user_name || user.username || 'Unknown'}</td>
                <td>${formatNumber(user.words_learned || 0)}</td>
                <td>${formatNumber(user.exercises_completed || 0)}</td>
                <td>${formatPercentage(user.accuracy || 0)}</td>
                <td>${formatRelativeTime(user.last_active || user.last_activity)}</td>
                <td>
                    <a href="user-detail.html?user_id=${user.user_id || user.id}" class="btn" style="padding: 8px 16px; font-size: 0.9em;">
                        View Details
                    </a>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('[Dashboard] Error loading users:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-state-icon">❌</div>
                        <div class="empty-state-message">Failed to load users</div>
                    </div>
                </td>
            </tr>
        `;
    }
}

async function loadDifficultWords() {
    const tbody = document.getElementById('difficultWordsTableBody');
    
    try {
        const data = await callSupabaseFunction('get_difficult_words', { limit: 10 });
        const words = normalizeArray(data);
        
        if (words.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="empty-state">
                            <div class="empty-state-icon">📖</div>
                            <div class="empty-state-message">No difficult words data available</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = words.map(word => {
            const errorRate = Number(word.error_rate || 0);
            const difficulty = word.difficulty || 'medium';
            
            return `
                <tr>
                    <td><strong>${word.word || 'N/A'}</strong></td>
                    <td>${word.translation || 'N/A'}</td>
                    <td>${formatNumber(word.times_taught || 0)}</td>
                    <td>${formatPercentage(errorRate)}</td>
                    <td><span class="badge ${getDifficultyBadgeClass(difficulty)}">${difficulty}</span></td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('[Dashboard] Error loading difficult words:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <div class="empty-state-icon">❌</div>
                        <div class="empty-state-message">Failed to load difficult words</div>
                    </div>
                </td>
            </tr>
        `;
    }
}

async function loadRecentActivity() {
    const feed = document.getElementById('activityFeed');
    
    try {
        const data = await callSupabaseFunction('get_recent_activity', { limit: 20 });
        const activities = normalizeArray(data);
        
        if (activities.length === 0) {
            feed.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-message">No recent activity</div>
                </div>
            `;
            return;
        }
        
        feed.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-header">
                    <span class="activity-user">${activity.user_name || activity.username || 'User'}</span>
                    <span class="activity-time">${formatRelativeTime(activity.timestamp || activity.activity_time)}</span>
                </div>
                <div class="activity-details">
                    ${activity.activity_type || activity.type || 'Activity'}: ${activity.details || activity.description || 'N/A'}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('[Dashboard] Error loading recent activity:', error);
        feed.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <div class="empty-state-message">Failed to load activity feed</div>
            </div>
        `;
    }
}

function renderEmptyChart(canvasId, message) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    const parent = ctx.parentElement;
    parent.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <div class="empty-state-message">${message}</div>
        </div>
        <canvas id="${canvasId}" style="display: none;"></canvas>
    `;
}
