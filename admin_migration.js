/**
 * Database Migration Script
 * 목적: existing 데이터의 recent_order 필드 초기화
 * 기준: created_at DESC (최신순)으로 0..N 부여
 */

async function runRecentOrderMigration() {
    if (!confirm("모든 자료의 recent_order를 created_at 기준으로 초기화하시겠습니까? (이 작업은 1회만 권장됩니다)")) return;

    console.log("Migration started...");
    try {
        const snapshot = await db.collection("posts").orderBy("createdAt", "desc").get();
        if (snapshot.empty) {
            console.log("No posts found.");
            return;
        }

        const batch = db.batch();
        let count = 0;

        snapshot.forEach((doc) => {
            const ref = db.collection("posts").doc(doc.id);
            // 0부터 시작하여 N까지 부여 (최신순)
            batch.update(ref, { recent_order: count });
            count++;
        });

        await batch.commit();
        alert(`성공: ${count}개의 자료에 recent_order가 부여되었습니다.`);
        console.log("Migration completed.");

        if (window.loadAdminPosts) window.loadAdminPosts();
    } catch (e) {
        console.error("Migration failed:", e);
        alert("마이그레이션 실패: " + e.message);
    }
}

// Rollback logic (optionally requested)
async function rollbackRecentOrderMigration() {
    if (!confirm("모든 자료의 recent_order 필드를 삭제하시겠습니까?")) return;

    try {
        const snapshot = await db.collection("posts").get();
        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.update(doc.ref, { recent_order: firebase.firestore.FieldValue.delete() });
        });
        await batch.commit();
        alert("recent_order 필드가 모두 삭제되었습니다.");
    } catch (e) {
        console.error(e);
        alert("롤백 실패");
    }
}

async function migrateLawCategory() {
    if (!confirm("'율법' 관련 자료들을 '율법과 복음'으로 이동하시겠습니까?")) return;

    console.log("Law Category Migration started...");
    try {
        const snapshot = await db.collection("posts").get();
        const batch = db.batch();
        let count = 0;

        snapshot.forEach((doc) => {
            const data = doc.data();
            const title = data.title || "";
            const content = data.content || "";
            const combined = (title + " " + content).toLowerCase();
            const tags = data.tags || [];

            // 율법 키워드가 있고, 아직 율법과 복음 태그가 없는 경우
            if (combined.includes("율법") && !tags.includes("율법과 복음")) {
                const newTags = [...tags.filter(t => t !== "인간론")]; // 인간론에서 제거 (기존에 거기 있었을 확률이 높음)
                if (!newTags.includes("율법과 복음")) newTags.push("율법과 복음");
                if (!newTags.includes("청교도 신학")) newTags.push("청교도 신학");

                batch.update(doc.ref, {
                    tags: newTags,
                    topic: "청교도 신학",
                    series: "율법과 복음",
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                count++;
            }
        });

        if (count > 0) {
            await batch.commit();
            alert(`성공: ${count}개의 자료가 '율법과 복음'으로 이동되었습니다.`);
        } else {
            alert("이동할 자료가 없습니다.");
        }
        console.log("Migration completed.");
        if (window.loadAdminPosts) window.loadAdminPosts();
    } catch (e) {
        console.error("Migration failed:", e);
        alert("마이그레이션 실패: " + e.message);
    }
}

/**
 * 전도, 선교 자료 -> '전도, 부흥, 선교'로 일괄 이전 및 세부 폴더(전도/부흥/선교) 자동 분류 마이그레이션
 */
async function migrateEvangelismToRevivalAndMissions(silent = false) {
    if (!silent && !confirm("기존 '전도, 선교'의 모든 자료를 '전도, 부흥, 선교'로 이전하고 세부 폴더(전도/부흥/선교)로 분류하시겠습니까?")) return;

    try {
        if (!db) {
            console.warn("DB not initialized yet.");
            return;
        }

        const snapshot = await db.collection("posts").get();
        const batch = db.batch();
        let count = 0;

        snapshot.forEach((doc) => {
            const data = doc.data();
            const tags = data.tags || [];
            const topic = data.topic || "";
            const series = data.series || "";
            const title = data.title || "";
            const content = data.content || "";
            const combined = (title + " " + content).toLowerCase();

            const isOldEvangelism = tags.includes("전도, 선교") || topic === "전도, 선교" || series === "전도, 선교" || tags.includes("전도 소책자");

            if (isOldEvangelism) {
                // 1. 구 '전도, 선교' 태그 제거 및 '전도, 부흥, 선교' 추가
                let newTags = tags.filter(t => t !== "전도, 선교");
                if (!newTags.includes("전도, 부흥, 선교")) newTags.push("전도, 부흥, 선교");

                // 2. 세부 분류 결정 (부흥 / 선교 / 전도)
                let targetSub = "전도"; // 기본값
                if (combined.includes("부흥") || combined.includes("대각성") || combined.includes("각성") || series === "부흥") {
                    targetSub = "부흥";
                    if (!newTags.includes("부흥")) newTags.push("부흥");
                } else if (combined.includes("선교") || combined.includes("선교사") || series === "선교") {
                    targetSub = "선교";
                    if (!newTags.includes("선교")) newTags.push("선교");
                } else {
                    targetSub = "전도";
                    if (!newTags.includes("전도")) newTags.push("전도");
                }

                let newSeries = series;
                if (!newSeries || newSeries === "전도, 선교") {
                    newSeries = targetSub;
                }

                batch.update(doc.ref, {
                    tags: newTags,
                    topic: "전도, 부흥, 선교",
                    series: newSeries,
                    subTopic: targetSub,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                count++;
            }
        });

        if (count > 0) {
            await batch.commit();
            if (!silent) alert(`성공: 총 ${count}개의 자료가 '전도, 부흥, 선교'로 안전하게 이전되었습니다.`);
            console.log(`Successfully migrated ${count} posts to '전도, 부흥, 선교'.`);
        } else {
            if (!silent) alert("이전할 기존 '전도, 선교' 자료가 없거나 이미 모두 완료되었습니다.");
        }

        if (window.loadAdminPosts) window.loadAdminPosts();
        if (typeof window.loadFolderOrganizerPosts === 'function') window.loadFolderOrganizerPosts();
    } catch (e) {
        console.error("Evangelism migration error:", e);
        if (!silent) alert("이전 작업 중 오류 발생: " + e.message);
    }
}
