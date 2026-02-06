/**
 * 관리자 통계 대시보드 로직
 */

const AdminStats = (() => {
    let currentPeriod = 'all';

    async function load(period = 'all') {
        currentPeriod = period;
        updateTabUI(period);

        if (!window.db) return;

        try {
            // 1. KPI 데이터 로드 (analytics_summary 사용)
            await loadKPIs(period);

            // 2. 랭킹 데이터 로드
            await loadRanking(period);

        } catch (e) {
            console.error("AdminStats load error:", e);
        }
    }

    function updateTabUI(period) {
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
            btn.style.background = btn.dataset.period === period ? '#9b59b6' : 'transparent';
            btn.style.color = btn.dataset.period === period ? '#white' : '#666';
            if (btn.dataset.period === period) btn.style.color = 'white';
        });
    }

    async function loadKPIs(period) {
        let totalVisitors = 0;
        let totalViews = 0;
        let totalClicks = 0;
        let totalDownloads = 0;

        const summaryCol = db.collection("analytics_summary");
        let query = summaryCol;

        if (period !== 'all') {
            const days = period === 'today' ? 0 : (period === '7d' ? 7 : 30);
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - days);
            const dateStr = targetDate.toISOString().split('T')[0];
            query = summaryCol.where("date", ">=", dateStr);
        }

        const snapshot = await query.get();
        snapshot.forEach(doc => {
            const data = doc.data();
            totalVisitors += data.total_visitors || 0;
            totalViews += data.total_views || 0;
            totalClicks += data.total_clicks || 0;
            totalDownloads += data.total_downloads || 0;
        });

        document.getElementById('stat-total-visitors').textContent = totalVisitors.toLocaleString();
        document.getElementById('stat-total-views').textContent = totalViews.toLocaleString();
        document.getElementById('stat-total-clicks').textContent = totalClicks.toLocaleString();
        document.getElementById('stat-total-downloads').textContent = totalDownloads.toLocaleString();
    }

    async function loadRanking(period) {
        const tbody = document.getElementById('stats-ranking-body');
        tbody.innerHTML = '<tr><td colspan="7" style="padding: 40px; text-align: center;"><i class="fas fa-spinner fa-spin"></i> 데이터를 분석 중입니다...</td></tr>';

        let dataMap = {}; // { contentId: { title, type, views, clicks, downloads, last } }

        if (period === 'all') {
            // 전체 기간은 원본 카운터 컬렉션에서 직접 가져옴 (성능 최적화)
            const snapshot = await db.collection("analytics_counters").orderBy("views", "desc").limit(50).get();
            snapshot.forEach(doc => {
                dataMap[doc.id] = { id: doc.id, ...doc.data() };
            });
        } else {
            // 특정 기간 필터링은 raw 이벤트를 순회하며 집계 (최근 7일/30일)
            const days = period === 'today' ? 0 : (period === '7d' ? 7 : 30);
            const start = new Date();
            if (period === 'today') start.setHours(0, 0, 0, 0);
            else start.setDate(start.getDate() - days);

            const snapshot = await db.collection("analytics_events")
                .where("timestamp", ">=", start)
                .limit(1000) // 비용 방지를 위한 과부하 제한
                .get();

            snapshot.forEach(doc => {
                const ev = doc.data();
                const cid = ev.content_id;
                if (!dataMap[cid]) {
                    dataMap[cid] = {
                        title: ev.title,
                        content_type: ev.content_type,
                        views: 0, clicks: 0, downloads: 0,
                        last_event: ev.timestamp
                    };
                }
                if (ev.event_type === 'view') dataMap[cid].views++;
                if (ev.event_type === 'click') dataMap[cid].clicks++;
                if (ev.event_type === 'download') dataMap[cid].downloads++;
                if (ev.timestamp > (dataMap[cid].last_event || 0)) dataMap[cid].last_event = ev.timestamp;
            });
        }

        const sorted = Object.values(dataMap).sort((a, b) => (b.views || 0) - (a.views || 0));

        if (sorted.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="padding: 40px; text-align: center; color:#999;">해당 기간의 데이터가 없습니다.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        sorted.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #eee';

            const lastDate = item.last_event ? (item.last_event.toDate ? item.last_event.toDate() : new Date(item.last_event)).toLocaleString() : '-';

            tr.innerHTML = `
                <td style="padding:12px;">${index + 1}</td>
                <td style="padding:12px; font-weight:500;">${item.title || '제목 없음'}</td>
                <td style="padding:12px;"><span style="font-size:0.7rem; background:#eee; padding:2px 6px; border-radius:4px;">${item.content_type || 'page'}</span></td>
                <td style="padding:12px; text-align:center;">${(item.views || 0).toLocaleString()}</td>
                <td style="padding:12px; text-align:center;">${(item.clicks || 0).toLocaleString()}</td>
                <td style="padding:12px; text-align:center;">${(item.downloads || 0).toLocaleString()}</td>
                <td style="padding:12px; text-align:right; font-size:0.8rem; color:#888;">${lastDate}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function exportCSV() {
        const tbody = document.getElementById('stats-ranking-body');
        const rows = tbody.querySelectorAll('tr');
        if (rows.length === 0 || rows[0].innerText.includes('데이터가 없습니다')) {
            alert("내보낼 데이터가 없습니다.");
            return;
        }

        let csv = "\uFEFF순위,제목,타입,조회수,클릭수,다운로드수,최근활동\n";
        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
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
