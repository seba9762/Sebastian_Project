/**
 * User Detail JavaScript - Comprehensive user analytics
 * Loads ALL user-specific data and renders visualizations
 */

import {
    initAPI,
    callSupabaseFunction,
    formatNumber,
    formatDate,
    formatRelativeDate,
    showError,
    showSuccess,
    createChart,
    getDifficultyBadge,
    getSeverityBadge,
    createEmptyState
} from './api.js';

let charts = {};
let currentUserId = null;

/**
 * Initialize user detail page
 */
export async function initUserDetail(supabaseUrl, supabaseKey, userId) {
    console.log('🚀 Initializing user detail page...', userId);
    
    initAPI(supabaseUrl, supabaseKey);
    currentUserId = userId;
    
    document.getElementById('userId').textContent = `User ID: ${userId}`;
    
    setupEventListeners();
    
    await loadAllUserData();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.disabled = true;
            refreshBtn.textContent = '🔄 Loading...';
            await loadAllUserData();
            refreshBtn.disabled = false;
            refreshBtn.textContent = '🔄 Refresh';
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

/**
 * Load all user data
 */
async function loadAllUserData() {
    try {
        await Promise.all([
            loadUserStats(),
            loadProgressTimeline(),
            loadWordMastery(),
            loadLearningPatterns(),
            loadMistakeAnalysis(),
            loadMistakeTrends(),
            loadChapterProgress(),
            loadChallengingWords(),
            loadRecentActivity()
        ]);
        
        showSuccess('User data loaded successfully!');
    } catch (error) {
        console.error('Error loading user data:', error);
        showError(`Failed to load user data: ${error.message}`);
    }
}

/**
 * Load user detailed stats
 */
async function loadUserStats() {
    try {
        const data = await callSupabaseFunction('get_user_detailed_stats', {
            user_id: currentUserId
        });
        
        if (!data || data.length === 0) {
            console.warn('No user stats available');
            return;
        }
        
        const stats = data[0] || data;
        
        document.getElementById('wordsLearned').textContent = formatNumber(stats.total_words || 0);
        document.getElementById('currentStreak').textContent = formatNumber(stats.current_streak || 0);
        document.getElementById('accuracyRate').textContent = `${(stats.accuracy_rate || 0).toFixed(1)}%`;
        document.getElementById('totalSessions').textContent = formatNumber(stats.total_sessions || 0);
        
        const subtitle = `${stats.user_name || stats.username || 'Unknown User'}`;
        document.getElementById('userSubtitle').textContent = subtitle;
    } catch (error) {
        console.error('Error loading user stats:', error);
        document.getElementById('wordsLearned').textContent = '0';
        document.getElementById('currentStreak').textContent = '0';
        document.getElementById('accuracyRate').textContent = '0%';
        document.getElementById('totalSessions').textContent = '0';
    }
}

/**
 * Load progress timeline (30 days)
 */
async function loadProgressTimeline() {
    try {
        const data = await callSupabaseFunction('get_user_progress_timeline', {
            user_id: currentUserId,
            days: 30
        });
        
        if (!data || data.length === 0) {
            console.warn('No progress timeline data');
            return;
        }
        
        const labels = data.map(d => {
            const date = new Date(d.date || d.activity_date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const wordsLearned = data.map(d => d.words_learned || d.words || 0);
        const sessions = data.map(d => d.session_count || d.sessions || 0);
        
        if (charts.progressChart) {
            charts.progressChart.destroy();
        }
        
        charts.progressChart = createChart('progressChart', 'line', {
            labels,
            datasets: [
                {
                    label: 'Words Learned',
                    data: wordsLearned,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Sessions',
                    data: sessions,
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4,
                    fill: true
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
        console.error('Error loading progress timeline:', error);
    }
}

/**
 * Load word mastery breakdown
 */
async function loadWordMastery() {
    try {
        const data = await callSupabaseFunction('get_user_word_mastery', {
            user_id: currentUserId
        });
        
        if (!data || data.length === 0) {
            console.warn('No word mastery data');
            return;
        }
        
        const labels = data.map(d => d.mastery_level || d.level || 'Unknown');
        const counts = data.map(d => d.word_count || d.count || 0);
        
        if (charts.masteryChart) {
            charts.masteryChart.destroy();
        }
        
        charts.masteryChart = createChart('masteryChart', 'doughnut', {
            labels,
            datasets: [{
                label: 'Words',
                data: counts,
                backgroundColor: [
                    '#28a745',
                    '#ffc107',
                    '#dc3545',
                    '#667eea',
                    '#17a2b8'
                ]
            }]
        }, {
            plugins: {
                legend: {
                    display: true,
                    position: 'right'
                }
            }
        });
    } catch (error) {
        console.error('Error loading word mastery:', error);
    }
}

/**
 * Load learning patterns (time of day)
 */
async function loadLearningPatterns() {
    try {
        const data = await callSupabaseFunction('get_user_learning_patterns', {
            user_id: currentUserId
        });
        
        if (!data || data.length === 0) {
            console.warn('No learning patterns data');
            return;
        }
        
        const labels = data.map(d => {
            const hour = d.hour_of_day || d.hour || 0;
            return `${hour}:00`;
        });
        const activity = data.map(d => d.activity_count || d.count || 0);
        
        if (charts.patternsChart) {
            charts.patternsChart.destroy();
        }
        
        charts.patternsChart = createChart('patternsChart', 'bar', {
            labels,
            datasets: [{
                label: 'Learning Activity',
                data: activity,
                backgroundColor: '#764ba2'
            }]
        }, {
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        });
    } catch (error) {
        console.error('Error loading learning patterns:', error);
    }
}

/**
 * Load mistake analysis (by type, category, severity)
 */
async function loadMistakeAnalysis() {
    try {
        await Promise.all([
            loadMistakesByType(),
            loadMistakesByCategory(),
            loadMistakesBySeverity()
        ]);
    } catch (error) {
        console.error('Error loading mistake analysis:', error);
    }
}

/**
 * Load mistakes by type
 */
async function loadMistakesByType() {
    try {
        const data = await callSupabaseFunction('get_user_mistakes_by_type', {
            user_id: currentUserId
        });
        
        if (!data || data.length === 0) {
            console.warn('No mistakes by type data');
            return;
        }
        
        const labels = data.map(d => d.mistake_type || d.type || 'Unknown');
        const counts = data.map(d => d.mistake_count || d.count || 0);
        
        if (charts.mistakeTypeChart) {
            charts.mistakeTypeChart.destroy();
        }
        
        charts.mistakeTypeChart = createChart('mistakeTypeChart', 'pie', {
            labels,
            datasets: [{
                label: 'Mistakes',
                data: counts,
                backgroundColor: [
                    '#dc3545',
                    '#ffc107',
                    '#17a2b8',
                    '#6c757d',
                    '#28a745'
                ]
            }]
        });
    } catch (error) {
        console.error('Error loading mistakes by type:', error);
    }
}

/**
 * Load mistakes by category
 */
async function loadMistakesByCategory() {
    try {
        const data = await callSupabaseFunction('get_user_mistakes_by_category', {
            user_id: currentUserId
        });
        
        if (!data || data.length === 0) {
            console.warn('No mistakes by category data');
            return;
        }
        
        const labels = data.map(d => d.category || 'Unknown');
        const counts = data.map(d => d.mistake_count || d.count || 0);
        
        if (charts.mistakeCategoryChart) {
            charts.mistakeCategoryChart.destroy();
        }
        
        charts.mistakeCategoryChart = createChart('mistakeCategoryChart', 'bar', {
            labels,
            datasets: [{
                label: 'Mistakes',
                data: counts,
                backgroundColor: '#dc3545'
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
        console.error('Error loading mistakes by category:', error);
    }
}

/**
 * Load mistakes by severity
 */
async function loadMistakesBySeverity() {
    try {
        const data = await callSupabaseFunction('get_user_mistakes_by_severity', {
            user_id: currentUserId
        });
        
        if (!data || data.length === 0) {
            console.warn('No mistakes by severity data');
            return;
        }
        
        const labels = data.map(d => d.severity || 'Unknown');
        const counts = data.map(d => d.mistake_count || d.count || 0);
        
        const colorMap = {
            'minor': '#17a2b8',
            'major': '#ffc107',
            'critical': '#721c24'
        };
        
        const colors = labels.map(label => 
            colorMap[label.toLowerCase()] || '#6c757d'
        );
        
        if (charts.mistakeSeverityChart) {
            charts.mistakeSeverityChart.destroy();
        }
        
        charts.mistakeSeverityChart = createChart('mistakeSeverityChart', 'doughnut', {
            labels,
            datasets: [{
                label: 'Mistakes',
                data: counts,
                backgroundColor: colors
            }]
        });
    } catch (error) {
        console.error('Error loading mistakes by severity:', error);
    }
}

/**
 * Load mistake trends (last 7 days)
 */
async function loadMistakeTrends() {
    try {
        const data = await callSupabaseFunction('get_user_mistake_trends', {
            user_id: currentUserId,
            days: 7
        });
        
        if (!data || data.length === 0) {
            console.warn('No mistake trends data');
            return;
        }
        
        const labels = data.map(d => {
            const date = new Date(d.date || d.mistake_date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
        const counts = data.map(d => d.mistake_count || d.count || 0);
        
        if (charts.mistakeTrendsChart) {
            charts.mistakeTrendsChart.destroy();
        }
        
        charts.mistakeTrendsChart = createChart('mistakeTrendsChart', 'line', {
            labels,
            datasets: [{
                label: 'Mistakes',
                data: counts,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
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
                    beginAtZero: true
                }
            }
        });
    } catch (error) {
        console.error('Error loading mistake trends:', error);
    }
}

/**
 * Load chapter progress
 */
async function loadChapterProgress() {
    try {
        const data = await callSupabaseFunction('get_chapter_progress', {
            user_id: currentUserId
        });
        
        const container = document.getElementById('chapterProgressContainer');
        if (!container) return;
        
        if (!data || data.length === 0) {
            container.innerHTML = createEmptyState('📖', 'No Chapter Progress', 'Start learning to see progress');
            return;
        }
        
        container.innerHTML = data.map(chapter => {
            const progress = chapter.completion_percentage || chapter.progress || 0;
            const progressClass = progress >= 80 ? 'success' : progress >= 50 ? 'warning' : 'danger';
            
            return `
                <div class="summary-card mb-2">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <strong>${chapter.chapter_name || chapter.name || 'Chapter ' + (chapter.chapter_number || '?')}</strong>
                        <span>${progress.toFixed(0)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${progressClass}" style="width: ${progress}%"></div>
                    </div>
                    <div style="margin-top: 5px; font-size: 0.85em; color: #666;">
                        ${chapter.words_learned || 0} / ${chapter.total_words || 0} words
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading chapter progress:', error);
        const container = document.getElementById('chapterProgressContainer');
        if (container) {
            container.innerHTML = '<div class="text-center text-danger">Error loading chapter progress</div>';
        }
    }
}

/**
 * Load challenging words
 */
async function loadChallengingWords() {
    try {
        const data = await callSupabaseFunction('get_user_challenging_words', {
            user_id: currentUserId,
            limit: 10
        });
        
        const tbody = document.getElementById('challengingWordsTable');
        if (!tbody) return;
        
        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">No challenging words yet</td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = data.map(word => {
            const successRate = word.success_rate || 0;
            
            return `
                <tr>
                    <td><strong>${word.german_word || word.word || 'N/A'}</strong></td>
                    <td>${word.english_translation || word.translation || 'N/A'}</td>
                    <td>${word.category || 'N/A'}</td>
                    <td>${formatNumber(word.attempt_count || word.attempts || 0)}</td>
                    <td>${successRate.toFixed(1)}%</td>
                    <td>${getDifficultyBadge(word.difficulty || 'moderate')}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading challenging words:', error);
        const tbody = document.getElementById('challengingWordsTable');
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
 * Load recent activity
 */
async function loadRecentActivity() {
    try {
        const data = await callSupabaseFunction('get_user_recent_activity', {
            user_id: currentUserId,
            limit: 20
        });
        
        const feed = document.getElementById('recentActivityFeed');
        if (!feed) return;
        
        if (!data || data.length === 0) {
            feed.innerHTML = createEmptyState('📭', 'No Recent Activity', 'No activity recorded yet');
            return;
        }
        
        feed.innerHTML = data.map(activity => {
            const icon = getActivityIcon(activity.activity_type || activity.type);
            const timeAgo = formatRelativeDate(activity.created_at || activity.timestamp);
            
            return `
                <div class="activity-item">
                    <div class="activity-icon">${icon}</div>
                    <div class="activity-content">
                        <div class="activity-text">
                            ${activity.description || activity.activity || 'Activity'}
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

export { loadAllUserData };
