import {
    initSupabase,
    callSupabaseFunction,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    formatNumber,
    formatPercentage,
    showError,
    showInfo,
    normalizeArray,
    getDifficultyBadgeClass,
    getSeverityBadgeClass
} from './api.js';

let userId = null;
let charts = {};

export async function initUserDetail(supabaseUrl, supabaseKey) {
    initSupabase(supabaseUrl, supabaseKey);
    
    userId = getUserIdFromUrl();
    if (!userId) {
        showError('No user ID provided. Please select a user from the dashboard.');
        return;
    }
    
    document.getElementById('refreshBtn')?.addEventListener('click', () => loadUserData());
    document.getElementById('printBtn')?.addEventListener('click', () => window.print());
    
    await loadUserData();
}

function getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('user_id');
}

async function loadUserData() {
    showInfo('Loading user data...');
    
    try {
        await Promise.all([
            loadUserStats(),
            loadTimeline(),
            loadMasteryDistribution(),
            loadLearningPatterns(),
            loadMistakeAnalysis(),
            loadChallengingWords(),
            loadRecentActivity(),
            loadChapterProgress()
        ]);
        
        document.getElementById('alertArea').innerHTML = '';
    } catch (error) {
        console.error('[UserDetail] Error loading data:', error);
        showError('Failed to load user data. Please check your connection.');
    }
}

async function loadUserStats() {
    try {
        const data = await callSupabaseFunction('get_user_stats', { user_id: userId });
        const stats = Array.isArray(data) && data.length > 0 ? data[0] : data;
        
        if (!stats) {
            throw new Error('No user stats returned');
        }
        
        document.getElementById('userNameSubtitle').textContent = 
            `User: ${stats.user_name || stats.username || userId}`;
        
        document.getElementById('statWordsLearned').textContent = 
            formatNumber(stats.words_learned || stats.total_words || 0);
        
        document.getElementById('statAccuracy').textContent = 
            formatPercentage(stats.accuracy || stats.overall_accuracy || 0);
        
        document.getElementById('statStreak').textContent = 
            formatNumber(stats.streak || stats.study_streak || 0);
        
        document.getElementById('statMastery').textContent = 
            formatPercentage(stats.mastery || stats.mastery_level || 0);
    } catch (error) {
        console.error('[UserDetail] Error loading stats:', error);
        document.getElementById('userNameSubtitle').textContent = `User ID: ${userId}`;
        document.getElementById('statWordsLearned').textContent = '0';
        document.getElementById('statAccuracy').textContent = '0%';
        document.getElementById('statStreak').textContent = '0';
        document.getElementById('statMastery').textContent = '0%';
    }
}

async function loadTimeline() {
    try {
        const data = await callSupabaseFunction('get_user_timeline', { user_id: userId, days: 30 });
        const timeline = normalizeArray(data);
        
        if (timeline.length === 0) {
            renderEmptyChart('timelineChart', 'No timeline data available');
            return;
        }
        
        const labels = timeline.map(item => formatDate(item.date || item.activity_date));
        const wordsLearned = timeline.map(item => Number(item.words_learned || item.words_count || 0));
        const accuracy = timeline.map(item => Number(item.accuracy || 0));
        
        const ctx = document.getElementById('timelineChart');
        destroyChart('timelineChart');
        
        charts.timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Words Learned',
                        data: wordsLearned,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        yAxisID: 'y',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Accuracy %',
                        data: accuracy,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        yAxisID: 'y1',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                },
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        title: { display: true, text: 'Words' }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Accuracy %' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    } catch (error) {
        console.error('[UserDetail] Error loading timeline:', error);
        renderEmptyChart('timelineChart', 'Failed to load timeline');
    }
}

async function loadMasteryDistribution() {
    try {
        const data = await callSupabaseFunction('get_user_mastery', { user_id: userId });
        const mastery = normalizeArray(data);
        
        if (mastery.length === 0) {
            renderEmptyChart('masteryChart', 'No mastery data available');
            return;
        }
        
        const labels = mastery.map(item => item.level || item.mastery_level || 'Unknown');
        const counts = mastery.map(item => Number(item.count || item.word_count || 0));
        
        const ctx = document.getElementById('masteryChart');
        destroyChart('masteryChart');
        
        charts.masteryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        '#28a745',
                        '#ffc107',
                        '#dc3545',
                        '#17a2b8',
                        '#6c757d'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    } catch (error) {
        console.error('[UserDetail] Error loading mastery:', error);
        renderEmptyChart('masteryChart', 'Failed to load mastery data');
    }
}

async function loadLearningPatterns() {
    try {
        const data = await callSupabaseFunction('get_user_learning_patterns', { user_id: userId });
        const patterns = normalizeArray(data);
        
        if (patterns.length === 0) {
            renderEmptyChart('heatmapChart', 'No learning pattern data available');
            return;
        }
        
        const labels = patterns.map(item => item.day_of_week || item.day || 'Unknown');
        const hours = patterns.map(item => Number(item.study_hours || item.hours || 0));
        
        const ctx = document.getElementById('heatmapChart');
        destroyChart('heatmapChart');
        
        charts.heatmapChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Study Hours',
                    data: hours,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Hours' }
                    }
                }
            }
        });
    } catch (error) {
        console.error('[UserDetail] Error loading learning patterns:', error);
        renderEmptyChart('heatmapChart', 'Failed to load learning patterns');
    }
}

async function loadMistakeAnalysis() {
    await Promise.all([
        loadMistakesByType(),
        loadMistakesByCategory(),
        loadMistakesBySeverity(),
        loadMistakeTrends()
    ]);
}

async function loadMistakesByType() {
    try {
        const data = await callSupabaseFunction('get_user_mistakes_by_type', { user_id: userId });
        const mistakes = normalizeArray(data);
        
        if (mistakes.length === 0) {
            renderEmptyChart('mistakeTypeChart', 'No mistake type data');
            return;
        }
        
        const labels = mistakes.map(item => item.type || item.mistake_type || 'Unknown');
        const counts = mistakes.map(item => Number(item.count || 0));
        
        const ctx = document.getElementById('mistakeTypeChart');
        destroyChart('mistakeTypeChart');
        
        charts.mistakeTypeChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#28a745',
                        '#ffc107',
                        '#dc3545'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    } catch (error) {
        console.error('[UserDetail] Error loading mistakes by type:', error);
        renderEmptyChart('mistakeTypeChart', 'Failed to load mistake types');
    }
}

async function loadMistakesByCategory() {
    try {
        const data = await callSupabaseFunction('get_user_mistakes_by_category', { user_id: userId });
        const mistakes = normalizeArray(data);
        
        if (mistakes.length === 0) {
            renderEmptyChart('mistakeCategoryChart', 'No category data');
            return;
        }
        
        const labels = mistakes.map(item => item.category || item.mistake_category || 'Unknown');
        const counts = mistakes.map(item => Number(item.count || 0));
        
        const ctx = document.getElementById('mistakeCategoryChart');
        destroyChart('mistakeCategoryChart');
        
        charts.mistakeCategoryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mistakes',
                    data: counts,
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: '#dc3545',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } catch (error) {
        console.error('[UserDetail] Error loading mistakes by category:', error);
        renderEmptyChart('mistakeCategoryChart', 'Failed to load categories');
    }
}

async function loadMistakesBySeverity() {
    try {
        const data = await callSupabaseFunction('get_user_mistakes_by_severity', { user_id: userId });
        const mistakes = normalizeArray(data);
        
        if (mistakes.length === 0) {
            renderEmptyChart('mistakeSeverityChart', 'No severity data');
            return;
        }
        
        const labels = mistakes.map(item => item.severity || item.mistake_severity || 'Unknown');
        const counts = mistakes.map(item => Number(item.count || 0));
        
        const colors = labels.map(label => {
            const l = label.toLowerCase();
            if (l === 'low' || l === 'minor') return '#28a745';
            if (l === 'moderate' || l === 'medium') return '#ffc107';
            if (l === 'high' || l === 'severe') return '#dc3545';
            return '#6c757d';
        });
        
        const ctx = document.getElementById('mistakeSeverityChart');
        destroyChart('mistakeSeverityChart');
        
        charts.mistakeSeverityChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    } catch (error) {
        console.error('[UserDetail] Error loading mistakes by severity:', error);
        renderEmptyChart('mistakeSeverityChart', 'Failed to load severity data');
    }
}

async function loadMistakeTrends() {
    try {
        const data = await callSupabaseFunction('get_user_mistake_trends', { user_id: userId, days: 30 });
        const trends = normalizeArray(data);
        
        if (trends.length === 0) {
            renderEmptyChart('mistakeTrendsChart', 'No trend data available');
            return;
        }
        
        const labels = trends.map(item => formatDate(item.date || item.mistake_date));
        const counts = trends.map(item => Number(item.count || item.mistake_count || 0));
        
        const ctx = document.getElementById('mistakeTrendsChart');
        destroyChart('mistakeTrendsChart');
        
        charts.mistakeTrendsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mistakes',
                    data: counts,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } catch (error) {
        console.error('[UserDetail] Error loading mistake trends:', error);
        renderEmptyChart('mistakeTrendsChart', 'Failed to load trends');
    }
}

async function loadChallengingWords() {
    const tbody = document.getElementById('challengingWordsBody');
    
    try {
        const data = await callSupabaseFunction('get_user_challenging_words', { user_id: userId, limit: 10 });
        const words = normalizeArray(data);
        
        if (words.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <div class="empty-state-icon">📖</div>
                            <div class="empty-state-message">No challenging words found</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = words.map(word => {
            const successRate = Number(word.success_rate || 0);
            const difficulty = word.difficulty || 'medium';
            
            return `
                <tr>
                    <td><strong>${word.word || 'N/A'}</strong></td>
                    <td>${word.translation || 'N/A'}</td>
                    <td>${formatNumber(word.attempts || word.attempt_count || 0)}</td>
                    <td>${formatPercentage(successRate)}</td>
                    <td><span class="badge ${getDifficultyBadgeClass(difficulty)}">${difficulty}</span></td>
                    <td>${formatRelativeTime(word.last_practiced || word.last_attempt)}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('[UserDetail] Error loading challenging words:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-state-icon">❌</div>
                        <div class="empty-state-message">Failed to load challenging words</div>
                    </div>
                </td>
            </tr>
        `;
    }
}

async function loadRecentActivity() {
    const tbody = document.getElementById('recentActivityBody');
    
    try {
        const data = await callSupabaseFunction('get_user_recent_activity', { user_id: userId, limit: 20 });
        const activities = normalizeArray(data);
        
        if (activities.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4">
                        <div class="empty-state">
                            <div class="empty-state-icon">📋</div>
                            <div class="empty-state-message">No recent activity</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = activities.map(activity => {
            const result = activity.result || activity.outcome || 'N/A';
            const isSuccess = result.toLowerCase().includes('success') || result.toLowerCase().includes('correct');
            const badgeClass = isSuccess ? 'badge-success' : 'badge-warning';
            
            return `
                <tr>
                    <td>${formatDateTime(activity.date || activity.timestamp || activity.activity_date)}</td>
                    <td>${activity.activity_type || activity.type || 'N/A'}</td>
                    <td>${activity.details || activity.description || 'N/A'}</td>
                    <td><span class="badge ${badgeClass}">${result}</span></td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('[UserDetail] Error loading recent activity:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        <div class="empty-state-icon">❌</div>
                        <div class="empty-state-message">Failed to load activity</div>
                    </div>
                </td>
            </tr>
        `;
    }
}

async function loadChapterProgress() {
    const container = document.getElementById('chapterProgressContainer');
    
    try {
        const data = await callSupabaseFunction('get_user_chapter_progress', { user_id: userId });
        const chapters = normalizeArray(data);
        
        if (chapters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <div class="empty-state-message">No chapter progress data</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = chapters.map(chapter => {
            const progress = Number(chapter.progress || chapter.completion_percentage || 0);
            
            return `
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <strong>${chapter.chapter_name || chapter.name || 'Chapter'}</strong>
                        <span>${formatPercentage(progress)}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div style="color: #666; font-size: 0.9em; margin-top: 5px;">
                        ${formatNumber(chapter.words_learned || 0)} / ${formatNumber(chapter.total_words || 0)} words
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('[UserDetail] Error loading chapter progress:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <div class="empty-state-message">Failed to load chapter progress</div>
            </div>
        `;
    }
}

function destroyChart(chartId) {
    if (charts[chartId]) {
        charts[chartId].destroy();
        delete charts[chartId];
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
