window.onload = async function() {
    buildGridOverlay();
    initialSetup();

    if (!window.leaderboardManager) {
        window.leaderboardManager = new LeaderboardManager();
        await window.leaderboardManager.loadScores();
    }
};

function initialSetup() {
    document.addEventListener('keydown', directions);
    cellCreator(2, 0);
    updateScore(0);
}

function buildGridOverlay() {
    var table = document.createElement('DIV');
    table.className = 'grid';
    table.id = 'grid';
    table.dataset.value = 0;
   
    for (var i = 0; i < 4; i++) {
        var tr = document.createElement('DIV');
        table.appendChild(tr);
        tr.className = 'grid_row';
        
        for (var j = 0; j < 4; j++) {
            var td = document.createElement('DIV');
            td.id = '' + (i+1) + (j+1);
            td.className = 'grid_cell';
            tr.appendChild(td);
        }
    }
    // Thêm grid vào đúng vị trí trong game div
    var gameDiv = document.querySelector('.game');
    if (gameDiv) {
        gameDiv.appendChild(table);
    }
    return table;
}

// ...existing code...

function cellCreator(c, timeOut) {
    for (var i = 0; i < c; i++) {
        var emptyCells = [];
        // Tìm tất cả ô trống thực sự
        for (var x = 1; x <= 4; x++) {
            for (var y = 1; y <= 4; y++) { /* Sửa lỗi cú pháp ở đây */
                var cell = document.getElementById('' + x + y);
                if (cell && cell.children.length === 0) {
                    emptyCells.push({x: x, y: y});
                }
            }
        }

        if (emptyCells.length === 0) return;

        // Chọn ngẫu nhiên một ô trống và tạo tile mới
        var randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        var randomValue = Math.random() < 0.9 ? 2 : 4;

        var position = document.getElementById('' + randomCell.x + randomCell.y);
        var tile = document.createElement('DIV');
        
        // Đặt các thuộc tính cho tile
        tile.innerHTML = randomValue;
        tile.dataset.value = randomValue;
        tile.id = 'tile_' + randomCell.x + randomCell.y;
        tile.className = 'tile';
        
        // Áp dụng style ngay lập tức
        colorSet(randomValue, tile);
        
        // Thêm tile vào grid cell
        position.appendChild(tile);
        position.className = 'grid_cell active';
        
        // Thêm animation sau khi append
        setTimeout(() => {
            tile.className = 'tile ' + randomValue;
        }, 50);
    }
}

function moveTilesMain(x, y, X, Y) {
    var tile = document.getElementById('tile_' + x + y);
    var checker = document.getElementById('' + x + y);
    
    if (!tile || !checker) return false;
    
    var xAround = x + X;
    var yAround = y + Y;
    
    if (xAround > 0 && xAround < 5 && yAround > 0 && yAround < 5) {
        var around = document.getElementById('' + xAround + yAround);
        if (!around) return false;

        if (around.className === 'grid_cell') {
            // Di chuyển tile
            around.appendChild(tile);
            around.className = 'grid_cell active';
            tile.id = 'tile_' + xAround + yAround;
            checker.className = 'grid_cell';
            return true;
        } else if (around.className === 'grid_cell active') {
            var aroundTile = around.children[0];
            if (aroundTile && 
                aroundTile.innerHTML === tile.innerHTML && 
                !aroundTile.classList.contains('merged')) {
                // Merge tiles
                var value = parseInt(tile.innerHTML) * 2;
                aroundTile.innerHTML = value;
                aroundTile.dataset.value = value;
                aroundTile.className = 'tile ' + value + ' merged';
                colorSet(value, aroundTile);
                
                checker.removeChild(tile);
                checker.className = 'grid_cell';
                
                updateScore(value);
                return true;
            }
        }
    }
    return false;
}

function colorSet(value, tile) {
    value = parseInt(value);
    const colors = {
        2: {bg: '#eee4da', color: '#776e65'},
        4: {bg: '#ede0c8', color: '#776e65'},
        8: {bg: '#f2b179', color: '#f9f6f2'},
        16: {bg: '#f59563', color: '#f9f6f2'},
        32: {bg: '#f67c5f', color: '#f9f6f2'},
        64: {bg: '#f65e3b', color: '#f9f6f2'},
        128: {bg: '#edcf72', color: '#f9f6f2'},
        256: {bg: '#edcc61', color: '#f9f6f2'},
        512: {bg: '#edc850', color: '#f9f6f2'},
        1024: {bg: '#edc53f', color: '#f9f6f2', fontSize: '35px'},
        2048: {bg: '#edc22e', color: '#f9f6f2', fontSize: '35px'}
    };

    if (colors[value]) {
        const style = colors[value];
        tile.style.backgroundColor = style.bg;
        tile.style.color = style.color;
        tile.setAttribute('data-value', value);
    }

    // Check win condition
    if (value === 2048) {
        document.getElementById('status').className = 'won';
    }
}

function directions(e) {
    if (e.keyCode < 37 || e.keyCode > 40) return;
    e.preventDefault();

    var moved = false;
    var grid = document.getElementById('grid');
    
    // Clear all merge flags before moving
    document.querySelectorAll('.merged').forEach(tile => {
        tile.classList.remove('merged');
    });

    // Process movement
    switch(e.keyCode) {
        case 38: // up
            for (var x = 1; x <= 4; x++) {
                for (var y = 1; y <= 4; y++) {
                    let didMove = false;
                    let currentX = y;
                    while (currentX > 1) {
                        if (moveTilesMain(currentX, x, -1, 0)) {
                            moved = true;
                            didMove = true;
                        }
                        currentX--;
                    }
                }
            }
            break;
        case 40: // down
            for (var x = 1; x <= 4; x++) {
                for (var y = 4; y >= 1; y--) {
                    let didMove = false;
                    let currentX = y;
                    while (currentX < 4) {
                        if (moveTilesMain(currentX, x, 1, 0)) {
                            moved = true;
                            didMove = true;
                        }
                        currentX++;
                    }
                }
            }
            break;
        case 37: // left
            for (var y = 1; y <= 4; y++) {
                for (var x = 1; x <= 4; x++) {
                    let didMove = false;
                    let currentY = x;
                    while (currentY > 1) {
                        if (moveTilesMain(y, currentY, 0, -1)) {
                            moved = true;
                            didMove = true;
                        }
                        currentY--;
                    }
                }
            }
            break;
        case 39: // right
            for (var y = 1; y <= 4; y++) {
                for (var x = 4; x >= 1; x--) {
                    let didMove = false;
                    let currentY = x;
                    while (currentY < 4) {
                        if (moveTilesMain(y, currentY, 0, 1)) {
                            moved = true;
                            didMove = true;
                        }
                        currentY++;
                    }
                }
            }
            break;
    }

    // Only create new tile if movement happened
    if (moved) {
        setTimeout(() => {
            cellReset();
            // Kiểm tra game over và cập nhật ngay lập tức
            if (!canMove()) {
                const status = document.getElementById('status');
                const finalScore = parseInt(document.getElementById('value').innerHTML) || 0;
                if (status) {
                    status.className = 'lose';
                }
                // Gọi ngay lập tức để cập nhật điểm số
                if (window.leaderboardManager) {
                    window.leaderboardManager.addScore(finalScore);
                }
            }
        }, 150);
    }
}

function cellReset() {
    var merged = document.querySelectorAll('.merged');
    merged.forEach(tile => {
        tile.classList.remove('merged');
    });

    // Đếm ô trống và kiểm tra có thể di chuyển
    var emptyCells = 0;
    var cells = document.querySelectorAll('.grid_cell');
    cells.forEach(cell => {
        if (!cell.hasChildNodes()) {
            emptyCells++;
        }
    });

    // Thêm tile mới nếu có thể
    if (emptyCells > 0) {
        cellCreator(1, 1);
    }
}

// Add helper function to check possible moves
function canMove() {
    for (var x = 1; x <= 4; x++) {
        for (var y = 1; y <= 4; y++) {
            var cell = document.getElementById('' + x + y);
            if (!cell.hasChildNodes()) return true;
            
            var tile = cell.firstChild;
            if (!tile) continue;
            
            var value = tile.innerHTML;
            
            // Check adjacent cells
            var dirs = [[0,1], [1,0], [0,-1], [-1,0]];
            for (let [dx, dy] of dirs) {
                var newX = x + dx;
                var newY = y + dy;
                if (newX < 1 || newX > 4 || newY < 1 || newY > 4) continue;
                
                var nextCell = document.getElementById('' + newX + newY);
                var nextTile = nextCell.firstChild;
                
                if (!nextTile || nextTile.innerHTML === value) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Xóa phần gọi addScore trong checkGameOver vì đã xử lý ở trên
function checkGameOver() {
    if (!canMove()) {
        var status = document.getElementById('status');
        if (status) {
            status.className = 'lose';
        }
        return true;
    }
    return false;
}

// Thêm hàm mới để cập nhật điểm
function updateScore(value) {
    var currentScore = parseInt(document.getElementById('value').innerHTML) || 0;
    document.getElementById('value').innerHTML = currentScore + value;
}

// Add function to check win condition
function checkWin() {
    var tiles = document.querySelectorAll('.tile');
    for (let tile of tiles) {
        if (parseInt(tile.innerHTML) === 2048) {
            return true;
        }
    }
    return false;
}

// Fix button reset và info
function info() {
    var description = document.getElementById('description');
    if(description) {
        description.classList.toggle('show');
    }
}

function reset() {
    // Clear all tiles
    var cells = document.querySelectorAll('.grid_cell');
    cells.forEach(cell => {
        cell.className = 'grid_cell';
        while (cell.firstChild) {
            cell.removeChild(cell.firstChild);
        }
    });

    // Reset score
    var scoreElement = document.getElementById('value');
    if(scoreElement) {
        scoreElement.innerHTML = '0';
    }

    // Reset status and ensure it's not blocking
    var statusElement = document.getElementById('status');
    if(statusElement) {
        statusElement.className = '';
        statusElement.style.pointerEvents = 'none';
    }

    // Reset grid
    var grid = document.getElementById('grid');
    if(grid) {
        grid.dataset.value = '0';
    }

    // Enable movements again
    document.removeEventListener('keydown', directions);
    document.addEventListener('keydown', directions);

    // Create new starting tiles
    cellCreator(2, 0);
    
    // Reset ghi nhận điểm cho game mới
    if (window.leaderboardManager) {
        window.leaderboardManager.resetGameRecord();
    }
}

/* Remove chat-related functions */
/*
function sendMessage() {
    // ... chat code ...
}

function loadChatHistory() {
    // ... chat code ...
}
*/
