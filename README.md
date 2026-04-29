# 图书馆熬夜大作战 - 卡牌肉鸽游戏

## 游戏说明
这是一个为大学生设计的卡牌肉鸽游戏，模拟在图书馆熬夜赶论文的场景。玩家需要通过使用卡牌来对抗各种敌人，管理困意、专注度等状态，完成所有关卡。

## 重要提示
**游戏不能直接双击HTML文件打开！** 因为浏览器的安全策略，使用ES模块的JavaScript文件需要通过HTTP服务器访问。

## 如何在Windows上运行

### 方法1：使用Python启动脚本（推荐）
1. 确保您的电脑安装了Python
   - 如果没有安装，访问 https://www.python.org/downloads/ 下载并安装
   - 安装时**务必勾选 "Add Python to PATH"**
2. 双击运行 `start-server.bat` 文件
3. 脚本会自动启动本地服务器
4. 打开浏览器，访问 `http://localhost:3000`
5. 开始游戏！

### 方法2：使用Node.js启动脚本（备用）
如果您没有Python，但有Node.js，可以使用此方法：
1. 确保您的电脑安装了Node.js
   - 如果没有安装，访问 https://nodejs.org/ 下载并安装
2. 双击运行 `start-server-node.bat` 文件
3. 脚本会自动下载并启动http-server
4. 打开浏览器，访问 `http://localhost:3000`
5. 开始游戏！

### 方法3：使用VS Code Live Server（开发推荐）
如果您使用VS Code编辑器：
1. 安装 "Live Server" 扩展
2. 在VS Code中打开游戏文件夹
3. 右键点击 `index.html`，选择 "Open with Live Server"
4. 浏览器会自动打开游戏

### 方法4：手动启动Python服务器
1. 打开命令提示符（Win+R，输入 `cmd`，回车）
2. 导航到游戏文件夹（例如：`cd D:\AI-Powered Card Roguelike Game Creation Guide`）
3. 运行命令：`python3 -m http.server 3000`（如果没有Python 3，尝试 `python -m http.server 3000`）
4. 打开浏览器，访问 `http://localhost:3000`

## 游戏特点
- 卡牌战斗系统
- 随机事件系统
- 困意、专注度等状态管理
- 树形地图路径选择
- 粒子特效
- 响应式设计

## 项目结构
- `index.html` - 游戏主页面
- `style.css` - 游戏样式
- `src/` - 游戏源代码
  - `config.js` - 游戏配置
  - `gameState.js` - 游戏状态管理
  - `main.js` - 主游戏逻辑
  - `mapManager.js` - 地图管理
  - `mapUI.js` - 地图界面
  - `particleSystem.js` - 粒子系统
  - `uiManager.js` - UI管理
- `start-server.bat` - Windows Python启动脚本
- `start-server-node.bat` - Windows Node.js启动脚本
- `start-server.sh` - Mac/Linux启动脚本
- `README.md` - 本说明文件

## 注意事项
- 游戏需要通过本地服务器运行，不能直接双击HTML文件打开
- 服务器启动后，请保持命令窗口打开
- 要停止服务器，在命令窗口按 Ctrl+C
- 游戏运行时，浏览器会显示游戏界面，您可以开始游戏了！

## 常见问题

**Q: 双击start-server.bat后，提示"无法找到Python"怎么办？**
A: 请按照README中的说明安装Python，并确保勾选"Add Python to PATH"。

**Q: 启动后浏览器访问localhost:3000显示无法访问？**
A: 请检查：1) 命令窗口是否还在运行？2) 端口3000是否被其他程序占用？

**Q: 可以部署到线上吗？**
A: 可以！将整个文件夹上传到您的服务器，通过域名访问即可。