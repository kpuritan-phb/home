/**
 * 관리자 통합 통계 대시보드 v2.0
 */

const AdminStats = (() => {
    let currentPeriod = 'all';
    let trafficChart = null;
    let categoryChart = null;

    async function load(period = 'all') {
        currentPeriod = period;
        updateTabUI(period);

        if (!window.db) return;

        try {
            // 1. KPI & Trend 데이터 로드
            await loadKPIsAndTrend(period);

            // 2. 랭킹 & 카테고리 & 활동 데이터 로드
            await loadRankingAndDetails(period);

        } catch (e) {
            console.error("AdminStats load error:", e);
        }
    }

    function updateTabUI(period) {
        document.querySelectorAll('.period-btn').forEach(btn => {
            const active = btn.dataset.period === period;
            btn.classList.toggle('active', active);
            btn.style.background = active ? '#9b59b6' : 'transparent';
            btn.style.color = active ? 'white' : '#666';
        });
    }

    async function loadKPIsAndTrend(period) {
        let totalVisitors = 0;
        let totalViews = 0;
        let totalClicks = 0;
        let totalDownloads = 0;

        const labels = [];
        const visitorData = [];
        const viewData = [];

        const summaryCol = db.collection("analytics_summary");
        let query = summaryCol.orderBy("date", "asc");

        if (period !== 'all') {
            const days = period === 'today' ? 0 : (period === '7d' ? 7 : 30);
            const targetDate = new Date();
            if (period === 'today') {
                const todayStr = targetDate.toISOString().split('T')[0];
                query = summaryCol.where("date", "==", todayStr);
            } else {
                targetDate.setDate(targetDate.getDate() - days);
                const dateStr = targetDate.toISOString().split('T')[0];
                query = summaryCol.where("date", ">=", dateStr).orderBy("date", "asc");
            }
        }

        const snapshot = await query.get();
        snapshot.forEach(doc => {
            const data = doc.data();
            totalVisitors += data.total_visitors || 0;
            totalViews += data.total_views || 0;
            totalClicks += data.total_clicks || 0;
            totalDownloads += data.total_downloads || 0;

            labels.push(data.date.substring(5)); // MM-DD
            visitorData.push(data.total_visitors || 0);
            viewData.push(data.total_views || 0);
        });

        document.getElementById('stat-total-visitors').textContent = totalVisitors.toLocaleString();
        document.getElementById('stat-total-views').textContent = totalViews.toLocaleString();
        document.getElementById('stat-total-clicks').textContent = totalClicks.toLocaleString();
        document.getElementById('stat-total-downloads').textContent = totalDownloads.toLocaleString();

        renderTrafficChart(labels, visitorData, viewData);
    }

    async function loadRankingAndDetails(period) {
        const tbody = document.getElementById('stats-ranking-body');
        const activityContainer = document.getElementById('activity-feed');
        const referrerContainer = document.getElementById('stats-referrers');

        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i></td></tr>';

        let dataMap = {};
        let categoryMap = {};
        let browserMap = {};
        let referrerMap = {};
        let recentEvents = [];

        if (period === 'all') {
            const snapshot = await db.collection("analytics_counters").orderBy("views", "desc").limit(20).get();
            snapshot.forEach(doc => {
                const d = doc.data();
                dataMap[doc.id] = { id: doc.id, ...d };
                const cat = d.category || '기타';
                categoryMap[cat] = (categoryMap[cat] || 0) + (d.views || 0);
            });

            // 실시간 이벤트 20개 가져오기
            const evSnapshot = await db.collection("analytics_events").orderBy("timestamp", "desc").limit(20).get();
            evSnapshot.forEach(doc => recentEvents.push(doc.data()));
        } else {
            const days = period === 'today' ? 0 : (period === '7d' ? 7 : 30);
            const start = new Date();
            if (period === 'today') start.setHours(0, 0, 0, 0);
            else start.setDate(start.getDate() - days);

            const snapshot = await db.collection("analytics_events")
                .where("timestamp", ">=", start)
                .orderBy("timestamp", "desc")
                .limit(500) // 비용 방지
                .get();

            snapshot.forEach((doc, idx) => {
                const ev = doc.data();
                if (idx < 20) recentEvents.push(ev);

                const cid = ev.content_id;
                if (!dataMap[cid]) {
                    dataMap[cid] = { title: ev.title, views: 0, clicks: 0 };
                }
                if (ev.event_type === 'view') dataMap[cid].views++;
                if (ev.event_type === 'click') dataMap[cid].clicks++;

                const cat = ev.category || '기타';
                categoryMap[cat] = (categoryMap[cat] || 0) + 1;

                // UA parsing (Simple)
                const ua = ev.ua || '';
                let browser = '기타';
                if (ua.includes('KAKAOTALK')) browser = '카톡';
                else if (ua.includes('iPhone')) browser = '아이폰';
                else if (ua.includes('Android')) browser = '안드로이드';
                else if (ua.includes('Chrome')) browser = '크롬';
                else if (ua.includes('Safari')) browser = '사파리';
                browserMap[browser] = (browserMap[browser] || 0) + 1;

                // Referrer
                let ref = '직접유입';
                if (ev.ref) {
                    try {
                        const url = new URL(ev.ref);
                        ref = url.hostname.replace('www.', '');
                    } catch (e) { ref = '외부링크'; }
                }
                referrerMap[ref] = (referrerMap[ref] || 0) + 1;
            });
        }

        // 1. Render Table
        const sorted = Object.values(dataMap).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 20);
        tbody.innerHTML = '';
        sorted.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding:8px; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.title || 'Untitled'}</td>
                <td style="padding:8px; text-align:center;">${(item.views || 0).toLocaleString()}</td>
                <td style="padding:8px; text-align:center;">${(item.clicks || 0).toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });

        // 2. Render Category Pie Chart
        renderCategoryChart(Object.keys(categoryMap), Object.values(categoryMap));

        // 3. Render Activity Feed
        activityContainer.innerHTML = '';
        recentEvents.forEach(ev => {
            const time = ev.timestamp ? (ev.timestamp.toDate ? ev.timestamp.toDate() : new Date(ev.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '지금';
            const item = document.createElement('div');
            item.style.padding = '8px 0';
            item.style.borderBottom = '1px solid #f5f5f5';
            let icon = 'eye';
            let color = '#2ecc71';
            let actionText = '조회';
            if (ev.event_type === 'click') { icon = 'mouse-pointer'; color = '#f1c40f'; actionText = '클릭'; }
            if (ev.event_type === 'download') { icon = 'download'; color = '#e74c3c'; actionText = '다운'; }

            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:600; color:${color}; margin-right:8px; font-size:0.7rem; border:1px solid ${color}; padding:1px 4px; border-radius:3px;">${actionText}</span>
                    <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:0.8rem;">${ev.title || '페이지'}</span>
                    <span style="color:#aaa; font-size:0.7rem; margin-left:8px;">${time}</span>
                </div>
            `;
            activityContainer.appendChild(item);
        });

        // 4. Render Browser/Referrer lists
        referrerContainer.innerHTML = `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <p style="font-weight:700; margin-bottom:8px; font-size:0.8rem; border-bottom:1px solid #eee; padding-bottom:3px;">인기 기기/환경</p>
                    ${Object.entries(browserMap).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>${k}</span><span style="font-weight:600;">${v}</span></div>`).join('') || '데이터 없음'}
                </div>
                <div>
                    <p style="font-weight:700; margin-bottom:8px; font-size:0.8rem; border-bottom:1px solid #eee; padding-bottom:3px;">인기 유입 경로</p>
                    ${Object.entries(referrerMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>${k}</span><span style="font-weight:600;">${v}</span></div>`).join('') || '데이터 없음'}
                </div>
            </div>
        `;
    }

    function renderTrafficChart(labels, visitors, views) {
        const canvas = document.getElementById('traffic-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (trafficChart) trafficChart.destroy();

        trafficChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '방문객',
                        data: visitors,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: '페이지뷰',
                        data: views,
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    function renderCategoryChart(labels, data) {
        const canvas = document.getElementById('category-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (categoryChart) categoryChart.destroy();

        if (labels.length === 0) return;

        categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#34495e', '#16a085', '#e67e22'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 }, padding: 15 } }
                },
                cutout: '70%',
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }

    function exportCSV() {
        const tbody = document.getElementById('stats-ranking-body');
        const rows = tbody.querySelectorAll('tr');
        if (rows.length === 0 || rows[0].innerText.includes('분석 중')) {
            alert("내보낼 데이터가 없습니다.");
            return;
        }

        let csv = "\uFEFF제목,조회수,클릭수\n";
        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length < 2) return;
            const rowData = Array.from(cols).map(col => `"${col.innerText.replace(/"/g, '""')}"`);
            csv += rowData.join(",") + "\n";
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `kpuritan_stats_${currentPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return { load, exportCSV };
})();

window.AdminStats = AdminStats;
