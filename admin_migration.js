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
