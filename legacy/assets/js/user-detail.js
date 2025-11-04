// ⚠️ CONFIGURE YOUR SUPABASE CREDENTIALS HERE ⚠️
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';

// Global variables
let userId = null;
let charts = {};

// ========== UTILITY FUNCTIONS ==========

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function showAlert(message, type = 'info') {
    const alertArea = document.getElementById('alertArea');
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
    
    setTimeout(() => {
        alertArea.innerHTML = '';
    }, 5000);
}

function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
    }
}

function hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('hidden');
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatRelativeTime(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - date) / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
    return formatDate(dateString);
}

function sanitizeNumber(value, defaultValue = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
}

function sanitizeInteger(value, defaultValue = 0) {
    const parsed = parseInt(value);
    return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
}

function getDifficultyBadge(difficulty) {
    if (!difficulty) return 'badge-info';
    const lower = difficulty.toLowerCase();
    if (lower === 'easy') return 'badge-easy';
    if (lower === 'medium') return 'badge-medium';
    if (lower === 'hard') return 'badge-hard';
    return 'badge-info';
}

function getSeverityBadge(severity) {
    if (!severity) return 'badge-info';
    const lower = severity.toLowerCase();
    if (lower === 'low') return 'badge-low';
    if (lower === 'moderate') return 'badge-moderate';
    if (lower === 'high') return 'badge-high';
    if (lower === 'critical') return 'badge-critical';
    return 'badge-info';
}

function getProgressClass(percentage) {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
}

function showEmptyState(containerId, icon, message, subtext = '') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <div class="empty-state-text">${message}</div>
                ${subtext ? `<div class="empty-state-subtext">${subtext}</div>` : ''}
            </div>
        `;
    }
}

function showTableEmpty(tableBodyId, colspan, message) {
    const tbody = document.getElementById(tableBodyId);
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="${colspan}" class="loading">${message}</td>
            </tr>
        `;
    }
}

// ========== SUPABASE API FUNCTIONS ==========

async function callSupabaseFunction(functionName, params = {}) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });
        
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error calling ${functionName}:`, error);
        return null;
    }
}

// ========== CHART INITIALIZATION ==========

function initializeCharts() {
    // Timeline Chart
    const timelineCtx = document.getElementById('timelineChart');
    if (timelineCtx) {
        charts.timeline = new Chart(timelineCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Words Learned',
                        data: [],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Study Time (min)',
                        data: [],
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
    
    // Mastery Chart
    const masteryCtx = document.getElementById('masteryChart');
    if (masteryCtx) {
        charts.mastery = new Chart(masteryCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#28a745',
                        '#ffc107',
                        '#dc3545',
                        '#6c757d'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Mistake Type Chart
    const mistakeTypeCtx = document.getElementById('mistakeTypeChart');
    if (mistakeTypeCtx) {
        charts.mistakeType = new Chart(mistakeTypeCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#4facfe',
                        '#43e97b'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Mistake Category Chart
    const mistakeCategoryCtx = document.getElementById('mistakeCategoryChart');
    if (mistakeCategoryCtx) {
        charts.mistakeCategory = new Chart(mistakeCategoryCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Count',
                    data: [],
                    backgroundColor: '#764ba2'
                }]
            },
            options: {
                responsive: true,
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
            }
        });
    }
    
    // Mistake Severity Chart
    const mistakeSeverityCtx = document.getElementById('mistakeSeverityChart');
    if (mistakeSeverityCtx) {
        charts.mistakeSeverity = new Chart(mistakeSeverityCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#28a745',
                        '#ffc107',
                        '#fd7e14',
                        '#dc3545'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Mistake Trends Chart
    const mistakeTrendsCtx = document.getElementById('mistakeTrendsChart');
    if (mistakeTrendsCtx) {
        charts.mistakeTrends = new Chart(mistakeTrendsCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Mistakes per Day',
                    data: [],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
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
            }
        });
    }
}

// ========== DATA UPDATE FUNCTIONS ==========

function updateUserStats(stats) {
    if (!stats) {
        showEmptyState('userStatsSection', '📊', 'No user stats available', 'Start learning to see your progress!');
        return;
    }
    
    const data = Array.isArray(stats) ? stats[0] : stats;
    
    document.getElementById('totalWords').textContent = sanitizeInteger(data.total_words_learned);
    document.getElementById('currentStreak').textContent = `${sanitizeInteger(data.current_streak)} 🔥`;
    document.getElementById('masteryLevel').textContent = `${sanitizeNumber(data.mastery_percentage, 0).toFixed(1)}%`;
    document.getElementById('totalTime').textContent = `${sanitizeNumber(data.total_study_hours, 0).toFixed(1)}h`;
    
    document.getElementById('wordsTrend').textContent = `📚 ${sanitizeInteger(data.words_this_week)} this week`;
    document.getElementById('masteryTrend').textContent = data.mastery_level || 'Beginner';
    
    showSection('userStatsSection');
}

function updateProgressTimeline(timeline) {
    if (!timeline || timeline.length === 0) {
        showEmptyState('timelineChart', '📈', 'No progress data yet', 'Complete activities to see your timeline');
        showSection('timelineSection');
        return;
    }
    
    const labels = timeline.map(item => formatDate(item.date).split(',')[0]);
    const wordsData = timeline.map(item => sanitizeInteger(item.words_learned));
    const timeData = timeline.map(item => sanitizeNumber(item.study_minutes));
    
    charts.timeline.data.labels = labels;
    charts.timeline.data.datasets[0].data = wordsData;
    charts.timeline.data.datasets[1].data = timeData;
    charts.timeline.update();
    
    showSection('timelineSection');
}

function updateWordMastery(mastery) {
    if (!mastery || mastery.length === 0) {
        showEmptyState('masteryChart', '📚', 'No mastery data available');
        showSection('masterySection');
        return;
    }
    
    const labels = mastery.map(item => item.mastery_level || 'Unknown');
    const counts = mastery.map(item => sanitizeInteger(item.word_count));
    
    charts.mastery.data.labels = labels;
    charts.mastery.data.datasets[0].data = counts;
    charts.mastery.update();
    
    showSection('masterySection');
}

function updateStudyHeatmap(patterns) {
    const heatmapContainer = document.getElementById('studyHeatmap');
    if (!heatmapContainer) return;
    
    if (!patterns || patterns.length === 0) {
        heatmapContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⏰</div>
                <div class="empty-state-text">No study pattern data</div>
                <div class="empty-state-subtext">Study at different times to see your patterns</div>
            </div>
        `;
        return;
    }
    
    // Create 24-hour heatmap
    const hourData = Array(24).fill(0);
    patterns.forEach(pattern => {
        const hour = sanitizeInteger(pattern.hour_of_day);
        if (hour >= 0 && hour < 24) {
            hourData[hour] = sanitizeInteger(pattern.activity_count);
        }
    });
    
    const maxActivity = Math.max(...hourData, 1);
    
    let html = '<div class="heatmap-container">';
    for (let i = 0; i < 24; i++) {
        const level = hourData[i] === 0 ? 0 : Math.min(4, Math.ceil((hourData[i] / maxActivity) * 4));
        html += `
            <div class="heatmap-cell level-${level}" title="${i}:00 - ${hourData[i]} activities">
                <div style="text-align: center; font-size: 0.7em; padding: 2px;">${i}</div>
            </div>
        `;
    }
    html += '</div>';
    
    html += `
        <div class="heatmap-legend">
            <span>Less</span>
            <div class="heatmap-legend-item">
                <div class="heatmap-legend-box level-0"></div>
            </div>
            <div class="heatmap-legend-item">
                <div class="heatmap-legend-box level-1"></div>
            </div>
            <div class="heatmap-legend-item">
                <div class="heatmap-legend-box level-2"></div>
            </div>
            <div class="heatmap-legend-item">
                <div class="heatmap-legend-box level-3"></div>
            </div>
            <div class="heatmap-legend-item">
                <div class="heatmap-legend-box level-4"></div>
            </div>
            <span>More</span>
        </div>
    `;
    
    heatmapContainer.innerHTML = html;
}

function updateMistakeAnalysis(analysis) {
    if (!analysis) {
        document.getElementById('totalMistakes').textContent = '0';
        document.getElementById('mistakeRate').textContent = '0%';
        document.getElementById('improvementRate').textContent = '0%';
        document.getElementById('criticalErrors').textContent = '0';
        return;
    }
    
    const data = Array.isArray(analysis) ? analysis[0] : analysis;
    
    document.getElementById('totalMistakes').textContent = sanitizeInteger(data.total_mistakes);
    document.getElementById('mistakeRate').textContent = `${sanitizeNumber(data.mistake_rate, 0).toFixed(1)}%`;
    document.getElementById('improvementRate').textContent = `${sanitizeNumber(data.improvement_rate, 0).toFixed(1)}%`;
    document.getElementById('criticalErrors').textContent = sanitizeInteger(data.critical_errors);
}

function updateMistakeCharts(byType, byCategory, bySeverity) {
    // Update mistakes by type
    if (byType && byType.length > 0) {
        const labels = byType.map(item => item.mistake_type || 'Unknown');
        const counts = byType.map(item => sanitizeInteger(item.count));
        
        charts.mistakeType.data.labels = labels;
        charts.mistakeType.data.datasets[0].data = counts;
        charts.mistakeType.update();
    } else {
        charts.mistakeType.data.labels = ['No data'];
        charts.mistakeType.data.datasets[0].data = [1];
        charts.mistakeType.update();
    }
    
    // Update mistakes by category
    if (byCategory && byCategory.length > 0) {
        const labels = byCategory.map(item => item.category || 'Unknown');
        const counts = byCategory.map(item => sanitizeInteger(item.count));
        
        charts.mistakeCategory.data.labels = labels;
        charts.mistakeCategory.data.datasets[0].data = counts;
        charts.mistakeCategory.update();
    } else {
        charts.mistakeCategory.data.labels = ['No data'];
        charts.mistakeCategory.data.datasets[0].data = [0];
        charts.mistakeCategory.update();
    }
    
    // Update mistakes by severity
    if (bySeverity && bySeverity.length > 0) {
        const labels = bySeverity.map(item => item.severity || 'Unknown');
        const counts = bySeverity.map(item => sanitizeInteger(item.count));
        
        charts.mistakeSeverity.data.labels = labels;
        charts.mistakeSeverity.data.datasets[0].data = counts;
        charts.mistakeSeverity.update();
    } else {
        charts.mistakeSeverity.data.labels = ['No data'];
        charts.mistakeSeverity.data.datasets[0].data = [1];
        charts.mistakeSeverity.update();
    }
    
    showSection('mistakeSection');
}

function updateMistakeTrends(trends) {
    if (!trends || trends.length === 0) {
        charts.mistakeTrends.data.labels = ['No data'];
        charts.mistakeTrends.data.datasets[0].data = [0];
        charts.mistakeTrends.update();
        return;
    }
    
    const labels = trends.map(item => formatDate(item.date).split(',')[0]);
    const counts = trends.map(item => sanitizeInteger(item.mistake_count));
    
    charts.mistakeTrends.data.labels = labels;
    charts.mistakeTrends.data.datasets[0].data = counts;
    charts.mistakeTrends.update();
}

function updateChallengingWords(words) {
    const tbody = document.getElementById('challengingWordsBody');
    
    if (!words || words.length === 0) {
        showTableEmpty('challengingWordsBody', 6, '🎉 No challenging words - you\'re doing great!');
        showSection('challengingWordsSection');
        return;
    }
    
    tbody.innerHTML = words.map(word => {
        const successRate = sanitizeNumber(word.success_rate, 0);
        const difficulty = word.difficulty || 'medium';
        
        return `
            <tr>
                <td><strong>${word.word || 'N/A'}</strong></td>
                <td>${word.translation || 'N/A'}</td>
                <td><span class="badge ${getDifficultyBadge(difficulty)}">${difficulty}</span></td>
                <td>${sanitizeInteger(word.attempt_count)}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill ${getProgressClass(successRate)}" style="width: ${successRate}%"></div>
                    </div>
                    <small>${successRate.toFixed(1)}%</small>
                </td>
                <td>${formatRelativeTime(word.last_attempted)}</td>
            </tr>
        `;
    }).join('');
    
    showSection('challengingWordsSection');
}

function updateRecentActivity(activities) {
    const tbody = document.getElementById('recentActivityBody');
    
    if (!activities || activities.length === 0) {
        showTableEmpty('recentActivityBody', 5, 'No recent activity');
        showSection('recentActivitySection');
        return;
    }
    
    tbody.innerHTML = activities.map(activity => {
        const result = activity.result || 'unknown';
        let resultBadge = 'badge-info';
        let resultText = result;
        
        if (result.toLowerCase() === 'correct' || result.toLowerCase() === 'success') {
            resultBadge = 'badge-success';
            resultText = '✓ ' + result;
        } else if (result.toLowerCase() === 'incorrect' || result.toLowerCase() === 'failed') {
            resultBadge = 'badge-danger';
            resultText = '✗ ' + result;
        }
        
        return `
            <tr>
                <td>${formatRelativeTime(activity.activity_date)}</td>
                <td>${activity.activity_type || 'N/A'}</td>
                <td><strong>${activity.word || 'N/A'}</strong></td>
                <td><span class="badge ${resultBadge}">${resultText}</span></td>
                <td>${sanitizeInteger(activity.time_spent_seconds)}s</td>
            </tr>
        `;
    }).join('');
    
    showSection('recentActivitySection');
}

function updateChapterProgress(chapters) {
    const tbody = document.getElementById('chapterProgressBody');
    
    if (!chapters || chapters.length === 0) {
        showTableEmpty('chapterProgressBody', 5, 'No chapter progress data');
        showSection('chapterProgressSection');
        return;
    }
    
    tbody.innerHTML = chapters.map(chapter => {
        const progress = sanitizeNumber(chapter.progress_percentage, 0);
        const mastery = sanitizeNumber(chapter.mastery_percentage, 0);
        
        let statusBadge = 'badge-info';
        let statusText = 'Not Started';
        
        if (progress >= 100) {
            statusBadge = 'badge-success';
            statusText = 'Completed';
        } else if (progress > 0) {
            statusBadge = 'badge-warning';
            statusText = 'In Progress';
        }
        
        return `
            <tr>
                <td><strong>${chapter.chapter_name || 'Chapter ' + chapter.chapter_number}</strong></td>
                <td>${sanitizeInteger(chapter.words_completed)} / ${sanitizeInteger(chapter.total_words)}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill ${getProgressClass(progress)}" style="width: ${progress}%"></div>
                    </div>
                    <small>${progress.toFixed(1)}%</small>
                </td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill ${getProgressClass(mastery)}" style="width: ${mastery}%"></div>
                    </div>
                    <small>${mastery.toFixed(1)}%</small>
                </td>
                <td><span class="badge ${statusBadge}">${statusText}</span></td>
            </tr>
        `;
    }).join('');
    
    showSection('chapterProgressSection');
}

// ========== MAIN DATA LOADING ==========

async function loadUserData() {
    if (!userId) {
        showAlert('No user ID provided in URL. Please provide ?user_id=XXX', 'error');
        return;
    }
    
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_KEY === 'YOUR_SUPABASE_KEY') {
        showAlert('⚠️ Please configure your Supabase credentials in the JavaScript file!', 'error');
        hideSection('loadingState');
        return;
    }
    
    try {
        // Show loading state
        showSection('loadingState');
        
        // Call all required Supabase functions
        const [
            detailedStats,
            progressTimeline,
            wordMastery,
            learningPatterns,
            mistakesByType,
            mistakesByCategory,
            mistakesBySeverity,
            mistakeAnalysis,
            mistakeTrends,
            challengingWords,
            recentActivity,
            chapterProgress
        ] = await Promise.all([
            callSupabaseFunction('get_user_detailed_stats', { p_user_id: userId }),
            callSupabaseFunction('get_user_progress_timeline', { p_user_id: userId, days: 30 }),
            callSupabaseFunction('get_user_word_mastery', { p_user_id: userId }),
            callSupabaseFunction('get_user_learning_patterns', { p_user_id: userId }),
            callSupabaseFunction('get_user_mistakes_by_type', { p_user_id: userId }),
            callSupabaseFunction('get_user_mistakes_by_category', { p_user_id: userId }),
            callSupabaseFunction('get_user_mistakes_by_severity', { p_user_id: userId }),
            callSupabaseFunction('get_user_mistake_analysis', { p_user_id: userId }),
            callSupabaseFunction('get_user_mistake_trends', { p_user_id: userId, days: 7 }),
            callSupabaseFunction('get_user_challenging_words', { p_user_id: userId, p_limit: 10 }),
            callSupabaseFunction('get_user_recent_activity', { p_user_id: userId, p_limit: 20 }),
            callSupabaseFunction('get_chapter_progress', { p_user_id: userId })
        ]);
        
        // Hide loading state
        hideSection('loadingState');
        
        // Update all sections
        updateUserStats(detailedStats);
        updateProgressTimeline(progressTimeline);
        updateWordMastery(wordMastery);
        updateStudyHeatmap(learningPatterns);
        updateMistakeAnalysis(mistakeAnalysis);
        updateMistakeCharts(mistakesByType, mistakesByCategory, mistakesBySeverity);
        updateMistakeTrends(mistakeTrends);
        updateChallengingWords(challengingWords);
        updateRecentActivity(recentActivity);
        updateChapterProgress(chapterProgress);
        
        // Update subtitle with user info
        if (detailedStats) {
            const data = Array.isArray(detailedStats) ? detailedStats[0] : detailedStats;
            document.getElementById('userSubtitle').textContent = 
                `${data.user_name || 'User'} - ID: ${userId}`;
        }
        
        showAlert('✅ User analytics loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showAlert(`❌ Error loading data: ${error.message}`, 'error');
        hideSection('loadingState');
    }
}

// ========== EXPORT AND PRINT FUNCTIONS ==========

function exportData() {
    // Collect all visible data
    const exportData = {
        userId: userId,
        exportDate: new Date().toISOString(),
        stats: {
            totalWords: document.getElementById('totalWords').textContent,
            currentStreak: document.getElementById('currentStreak').textContent,
            masteryLevel: document.getElementById('masteryLevel').textContent,
            totalTime: document.getElementById('totalTime').textContent
        }
    };
    
    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user_analytics_${userId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showAlert('📥 Data exported successfully!', 'success');
}

function printPage() {
    window.print();
}

// ========== INITIALIZATION ==========

window.addEventListener('load', () => {
    // Get user ID from query string
    userId = getQueryParam('user_id');
    
    if (!userId) {
        hideSection('loadingState');
        showAlert('⚠️ No user ID provided. Please add ?user_id=XXX to the URL', 'error');
        document.getElementById('userSubtitle').textContent = 'No user ID provided';
        return;
    }
    
    // Initialize all charts
    initializeCharts();
    
    // Load user data
    loadUserData();
});
