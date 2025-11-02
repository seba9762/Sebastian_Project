// Chart instances
let activityChart, difficultyChart, exerciseChart, performersChart;

// Initialize all charts
export function initCharts() {
    initActivityChart();
    initDifficultyChart();
    initExerciseChart();
    initPerformersChart();
}

// Daily Activity Chart
function initActivityChart() {
    const canvas = document.getElementById('activityChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Messages Sent',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'User Responses',
                data: [],
                borderColor: '#764ba2',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    mode: 'index',
                    intersect: false
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
function initDifficultyChart() {
    const canvas = document.getElementById('difficultyChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    difficultyChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Exercise Accuracy Chart
function initExerciseChart() {
    const canvas = document.getElementById('exerciseChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    exerciseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Completion Rate %',
                data: [],
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
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
function initPerformersChart() {
    const canvas = document.getElementById('performersChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    performersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Words Learned',
                data: [],
                backgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
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

// Update charts with new data
export function updateActivityChart(data) {
    if (!activityChart || !data || data.length === 0) {
        if (activityChart) {
            activityChart.data.labels = ['No data'];
            activityChart.data.datasets[0].data = [0];
            activityChart.data.datasets[1].data = [0];
            activityChart.update();
        }
        return;
    }
    
    const labels = data.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }));
    const messagesSent = data.map(d => parseInt(d.messages_sent) || 0);
    const responsesReceived = data.map(d => parseInt(d.responses_received) || 0);
    
    activityChart.data.labels = labels;
    activityChart.data.datasets[0].data = messagesSent;
    activityChart.data.datasets[1].data = responsesReceived;
    activityChart.update();
}

export function updateDifficultyChart(data) {
    if (!difficultyChart || !data || data.length === 0) {
        if (difficultyChart) {
            difficultyChart.data.labels = ['No data'];
            difficultyChart.data.datasets[0].data = [1];
            difficultyChart.update();
        }
        return;
    }
    
    const labels = data.map(d => (d.difficulty || '').charAt(0).toUpperCase() + (d.difficulty || '').slice(1));
    const counts = data.map(d => parseInt(d.count) || 0);
    
    difficultyChart.data.labels = labels;
    difficultyChart.data.datasets[0].data = counts;
    difficultyChart.update();
}

export function updateExerciseChart(data) {
    if (!exerciseChart || !data || data.length === 0) {
        if (exerciseChart) {
            exerciseChart.data.labels = ['No data'];
            exerciseChart.data.datasets[0].data = [0];
            exerciseChart.update();
        }
        return;
    }
    
    const labels = data.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }));
    const rates = data.map(d => parseFloat(d.completion_rate) || 0);
    
    exerciseChart.data.labels = labels;
    exerciseChart.data.datasets[0].data = rates;
    exerciseChart.update();
}

export function updatePerformersChart(users) {
    if (!performersChart || !users || users.length === 0) {
        if (performersChart) {
            performersChart.data.labels = ['No data'];
            performersChart.data.datasets[0].data = [0];
            performersChart.update();
        }
        return;
    }
    
    const topUsers = users
        .sort((a, b) => (b.words_learned || 0) - (a.words_learned || 0))
        .slice(0, 5);
    
    const names = topUsers.map(u => u.name || 'Unknown');
    const wordsCount = topUsers.map(u => parseInt(u.words_learned) || 0);
    
    performersChart.data.labels = names;
    performersChart.data.datasets[0].data = wordsCount;
    performersChart.update();
}
