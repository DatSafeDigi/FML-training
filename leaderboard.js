const STORAGE_KEY = '2048_leaderboard';

class LeaderboardManager {
    constructor() {
        this.leaderboard = this.loadLeaderboard();
        this.hasRecordedCurrentGame = false;
        this.displayLeaderboard(); /* Hiển thị ngay khi khởi tạo */
    }

    loadLeaderboard() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            return {
                top3: [],
                top10: []
            };
        }
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error loading leaderboard:', e);
            return {
                top3: [],
                top10: []
            };
        }
    }

    saveLeaderboard() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.leaderboard));
    }

    addScore(score) {
        if (this.hasRecordedCurrentGame) return; /* Chỉ ghi nhận 1 lần mỗi game */

        this.hasRecordedCurrentGame = true; /* Đánh dấu đã ghi nhận */

        // Thêm timeout ngắn để đảm bảo overlay hiện lên trước
        setTimeout(() => {
            const playerName = prompt('Congratulations! Enter your name for the leaderboard:') || 'Anonymous';
            const newScore = {
                name: playerName,
                score: score,
                date: new Date().toLocaleDateString()
            };

            // Cập nhật Top 10
            this.leaderboard.top10.push(newScore);
            this.leaderboard.top10.sort((a, b) => b.score - a.score);
            this.leaderboard.top10 = this.leaderboard.top10.slice(0, 10);

            // Cập nhật Top 3
            this.leaderboard.top3 = this.leaderboard.top10.slice(0, 3);

            this.saveLeaderboard();
            this.displayLeaderboard();
        }, 100);
    }

    displayLeaderboard() {
        const top3List = document.querySelector('.top3-list');
        const top10List = document.querySelector('.top10-list');

        if (top3List) {
            top3List.innerHTML = '';
            this.leaderboard.top3.forEach((entry, index) => {
                const li = document.createElement('div');
                li.className = 'top3-entry';
                li.innerHTML = `
                    <span class="rank">${index + 1}</span>
                    <span class="player-name">${entry.name}</span>
                    <span class="player-score">${entry.score}</span>
                `;
                top3List.appendChild(li);
            });
        }

        if (top10List) {
            top10List.innerHTML = '';
            this.leaderboard.top10.forEach((entry, index) => {
                const div = document.createElement('div');
                div.className = 'leaderboard-entry';
                div.innerHTML = `
                    <span class="rank">${index + 1}</span>
                    <span class="player-name">${entry.name}</span>
                    <span class="player-score">${entry.score}</span>
                `;
                top10List.appendChild(div);
            });
        }
    }

    resetGameRecord() {
        this.hasRecordedCurrentGame = false;
    }
}

// Tạo instance và gán vào window để có thể truy cập từ mọi nơi
window.leaderboardManager = new LeaderboardManager();
