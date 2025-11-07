// pages/index/index.js
Page({
  data: {
    grid: [], // 4x4的游戏面板
    tiles: [], // 用于渲染的方块数据
    score: 0,
    bestScore: 0,
    gameOver: false,
    won: false,
    touchStartX: 0,
    touchStartY: 0,
    tileIdCounter: 0
  },

  onLoad() {
    // 加载最高分
    const bestScore = wx.getStorageSync('bestScore') || 0;
    this.setData({ bestScore });
    this.newGame();
  },

  /**
   * 开始新游戏
   */
  newGame() {
    // 初始化4x4的空面板
    const grid = [];
    for (let i = 0; i < 4; i++) {
      grid[i] = [null, null, null, null];
    }

    this.setData({
      grid: grid,
      tiles: [],
      score: 0,
      gameOver: false,
      won: false,
      tileIdCounter: 0
    });

    // 添加两个初始方块
    this.addRandomTile();
    this.addRandomTile();
    this.updateTiles();
  },

  /**
   * 在随机空位置添加一个方块（90%概率是2，10%概率是4）
   */
  addRandomTile() {
    const emptyCells = [];

    // 找出所有空位置
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.data.grid[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length === 0) {
      return false;
    }

    // 随机选择一个空位置
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    // 90%概率生成2，10%概率生成4
    const value = Math.random() < 0.9 ? 2 : 4;

    const grid = this.data.grid;
    grid[randomCell.row][randomCell.col] = {
      value: value,
      id: this.data.tileIdCounter,
      new: true,
      merged: false
    };

    this.setData({
      grid: grid,
      tileIdCounter: this.data.tileIdCounter + 1
    });

    return true;
  },

  /**
   * 更新用于渲染的tiles数组
   */
  updateTiles() {
    const tiles = [];
    const grid = this.data.grid;

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (grid[row][col] !== null) {
          tiles.push({
            ...grid[row][col],
            row: row,
            col: col
          });
        }
      }
    }

    this.setData({ tiles });
  },

  /**
   * 触摸开始
   */
  touchStart(e) {
    this.setData({
      touchStartX: e.touches[0].clientX,
      touchStartY: e.touches[0].clientY
    });
  },

  /**
   * 触摸结束，判断滑动方向
   */
  touchEnd(e) {
    if (this.data.gameOver) return;

    const deltaX = e.changedTouches[0].clientX - this.data.touchStartX;
    const deltaY = e.changedTouches[0].clientY - this.data.touchStartY;

    // 判断是横向还是纵向滑动
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 横向滑动
      if (Math.abs(deltaX) > 30) { // 最小滑动距离
        if (deltaX > 0) {
          this.move('right');
        } else {
          this.move('left');
        }
      }
    } else {
      // 纵向滑动
      if (Math.abs(deltaY) > 30) { // 最小滑动距离
        if (deltaY > 0) {
          this.move('down');
        } else {
          this.move('up');
        }
      }
    }
  },

  /**
   * 移动方块
   */
  move(direction) {
    let moved = false;
    let score = this.data.score;
    const grid = JSON.parse(JSON.stringify(this.data.grid)); // 深拷贝

    // 清除所有方块的new和merged标记
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (grid[row][col]) {
          grid[row][col].new = false;
          grid[row][col].merged = false;
        }
      }
    }

    if (direction === 'left') {
      moved = this.moveLeft(grid);
    } else if (direction === 'right') {
      moved = this.moveRight(grid);
    } else if (direction === 'up') {
      moved = this.moveUp(grid);
    } else if (direction === 'down') {
      moved = this.moveDown(grid);
    }

    // 计算新增分数
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (grid[row][col] && grid[row][col].merged) {
          score += grid[row][col].value;
        }
      }
    }

    if (moved) {
      this.setData({ grid, score });
      this.updateTiles();

      // 延迟添加新方块，等待动画完成
      setTimeout(() => {
        this.addRandomTile();
        this.updateTiles();
        this.checkGameStatus();
      }, 200);
    }
  },

  /**
   * 向左移动
   */
  moveLeft(grid) {
    let moved = false;

    for (let row = 0; row < 4; row++) {
      let tiles = [];

      // 收集该行的所有非空方块
      for (let col = 0; col < 4; col++) {
        if (grid[row][col] !== null) {
          tiles.push(grid[row][col]);
        }
      }

      // 合并相同的方块
      const merged = this.mergeTiles(tiles);

      // 清空该行
      for (let col = 0; col < 4; col++) {
        grid[row][col] = null;
      }

      // 放回合并后的方块
      for (let i = 0; i < merged.length; i++) {
        if (grid[row][i] === null || grid[row][i].value !== merged[i].value || grid[row][i].id !== merged[i].id) {
          moved = true;
        }
        grid[row][i] = merged[i];
      }
    }

    return moved;
  },

  /**
   * 向右移动
   */
  moveRight(grid) {
    let moved = false;

    for (let row = 0; row < 4; row++) {
      let tiles = [];

      // 收集该行的所有非空方块（从右往左）
      for (let col = 3; col >= 0; col--) {
        if (grid[row][col] !== null) {
          tiles.push(grid[row][col]);
        }
      }

      // 合并相同的方块
      const merged = this.mergeTiles(tiles);

      // 清空该行
      for (let col = 0; col < 4; col++) {
        grid[row][col] = null;
      }

      // 放回合并后的方块（从右往左）
      for (let i = 0; i < merged.length; i++) {
        const col = 3 - i;
        if (grid[row][col] === null || grid[row][col].value !== merged[i].value || grid[row][col].id !== merged[i].id) {
          moved = true;
        }
        grid[row][col] = merged[i];
      }
    }

    return moved;
  },

  /**
   * 向上移动
   */
  moveUp(grid) {
    let moved = false;

    for (let col = 0; col < 4; col++) {
      let tiles = [];

      // 收集该列的所有非空方块
      for (let row = 0; row < 4; row++) {
        if (grid[row][col] !== null) {
          tiles.push(grid[row][col]);
        }
      }

      // 合并相同的方块
      const merged = this.mergeTiles(tiles);

      // 清空该列
      for (let row = 0; row < 4; row++) {
        grid[row][col] = null;
      }

      // 放回合并后的方块
      for (let i = 0; i < merged.length; i++) {
        if (grid[i][col] === null || grid[i][col].value !== merged[i].value || grid[i][col].id !== merged[i].id) {
          moved = true;
        }
        grid[i][col] = merged[i];
      }
    }

    return moved;
  },

  /**
   * 向下移动
   */
  moveDown(grid) {
    let moved = false;

    for (let col = 0; col < 4; col++) {
      let tiles = [];

      // 收集该列的所有非空方块（从下往上）
      for (let row = 3; row >= 0; row--) {
        if (grid[row][col] !== null) {
          tiles.push(grid[row][col]);
        }
      }

      // 合并相同的方块
      const merged = this.mergeTiles(tiles);

      // 清空该列
      for (let row = 0; row < 4; row++) {
        grid[row][col] = null;
      }

      // 放回合并后的方块（从下往上）
      for (let i = 0; i < merged.length; i++) {
        const row = 3 - i;
        if (grid[row][col] === null || grid[row][col].value !== merged[i].value || grid[row][col].id !== merged[i].id) {
          moved = true;
        }
        grid[row][col] = merged[i];
      }
    }

    return moved;
  },

  /**
   * 合并相同值的方块
   */
  mergeTiles(tiles) {
    const merged = [];
    let i = 0;

    while (i < tiles.length) {
      if (i + 1 < tiles.length && tiles[i].value === tiles[i + 1].value) {
        // 合并两个相同的方块
        merged.push({
          value: tiles[i].value * 2,
          id: this.data.tileIdCounter++,
          merged: true,
          new: false
        });
        i += 2;
      } else {
        // 保持原方块
        merged.push({
          ...tiles[i],
          merged: false
        });
        i++;
      }
    }

    return merged;
  },

  /**
   * 检查游戏状态
   */
  checkGameStatus() {
    const grid = this.data.grid;
    let hasEmpty = false;
    let canMove = false;
    let hasWon = false;

    // 检查是否有空格或2048
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (grid[row][col] === null) {
          hasEmpty = true;
        } else if (grid[row][col].value === 2048 && !this.data.won) {
          hasWon = true;
        }
      }
    }

    // 如果有空格，游戏继续
    if (hasEmpty) {
      if (hasWon) {
        this.setData({ won: true });
        setTimeout(() => {
          this.setData({ gameOver: true });
        }, 500);
      }
      return;
    }

    // 检查是否还能移动（有相邻的相同数字）
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const current = grid[row][col];

        // 检查右边
        if (col < 3 && grid[row][col + 1] && current.value === grid[row][col + 1].value) {
          canMove = true;
        }

        // 检查下边
        if (row < 3 && grid[row + 1][col] && current.value === grid[row + 1][col].value) {
          canMove = true;
        }
      }
    }

    // 游戏结束
    if (!canMove) {
      this.setData({ gameOver: true });

      // 更新最高分
      if (this.data.score > this.data.bestScore) {
        this.setData({ bestScore: this.data.score });
        wx.setStorageSync('bestScore', this.data.score);
      }
    } else if (hasWon) {
      this.setData({ won: true });
      setTimeout(() => {
        this.setData({ gameOver: true });
      }, 500);
    }
  }
});
