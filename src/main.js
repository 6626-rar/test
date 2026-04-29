// 主游戏逻辑

import GameState from './gameState.js';
import UIManager from './uiManager.js';
import ParticleSystem from './particleSystem.js';
import MapManager from './mapManager.js';
import MapUI from './mapUI.js';

class Game {
    constructor() {
        this.gameState = new GameState();
        this.uiManager = new UIManager();
        this.particleSystem = new ParticleSystem();
        this.mapManager = new MapManager();
        this.mapUI = new MapUI();
        
        this.bindEventListeners();
        this.initGame();
    }

    // 初始化游戏
    initGame() {
        // 初始化卡牌
        this.gameState.state.deck = [...this.gameState.state.cards];
        this.gameState.shuffleDeck();
        
        // 强制显示地图容器
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.style.display = 'block';
            mapContainer.classList.remove('hidden');
        }
        
        // 初始化地图UI
        this.mapUI.init('map-container', (nodeId) => this.handlePathSelect(nodeId));
        
        // 渲染地图树形图
        this.mapUI.render(
            this.mapManager.getMapData(),
            this.mapManager.getCurrentPath(),
            this.mapManager.getUnlockedNodes()
        );
        
        // 更新UI，确保休息按钮等元素状态正确
        this.updateUI();
        
        // 显示选路界面，让玩家选择第一关
        this.showPathSelection();
    }

    // 绑定事件监听器
    bindEventListeners() {
        this.uiManager.bindEventListeners({
            onRest: () => this.handleRest(),
            onEndTurn: () => this.handleEndTurn(),
            onNextLevel: () => this.handleNextLevel(),
            onRestart: () => this.handleRestart(),
            onContinue: () => this.handleContinue()
        });
    }

    // 处理休息
    handleRest() {
        const state = this.gameState.getState();
        
        // 检查是否已经使用过休息按钮
        if (state.restButtonUsed) {
            alert('休息按钮已经使用过了！');
            return;
        }
        
        // 检查是否在休息关
        const currentNode = this.mapManager.getCurrentNode();
        const isRestNode = currentNode && currentNode.type === 'rest';
        
        if (!isRestNode) {
            alert('只能在休息关使用休息按钮！');
            return;
        }
        
        // 使用休息按钮
        this.gameState.rest();
        this.gameState.state.restButtonUsed = true;
        this.updateUI();
    }

    // 处理结束回合
    handleEndTurn() {
        const state = this.gameState.getState();
        
        if (state.currentEnemy && state.currentEnemy.hp > 0) {
            // 将所有手牌加入弃牌堆
            state.discard.push(...state.hand);
            state.hand = [];
            
            // 敌人攻击
            setTimeout(() => {
                this.enemyAttack();
            }, 500);
        }
    }

    // 处理下一关
    handleNextLevel() {
        // 检查是否在休息关
        const currentNode = this.mapManager.getCurrentNode();
        const isRestNode = currentNode && currentNode.type === 'rest';
        
        // 只有在休息关才能点击下一关
        if (isRestNode) {
            // 直接进入选路界面，让玩家选择下一个路径
            this.showPathSelection();
        } else {
            // 其他情况下，不允许点击下一关
            alert('只有在休息关才能点击下一关！');
        }
    }

    // 处理重新开始
    handleRestart() {
        this.gameState.reset();
        this.uiManager.hideGameOver();
        this.uiManager.hideLevelUp();
        this.initGame();
    }

    // 处理继续
    handleContinue() {
        this.uiManager.hideLevelUp();
        // 从地图获取当前节点的敌人
        const currentNode = this.mapManager.getCurrentNode();
        this.gameState.startLevel(currentNode.enemy);
        this.updateUI();
    }

    // 处理卡牌点击
    handleCardClick(cardIndex, cardElement, card) {
        const state = this.gameState.getState();
        
        // 检查精力是否足够
        if (state.energy < card.cost) {
            alert('精力不足！');
            return;
        }
        
        // 创建粒子效果
        const rect = cardElement.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;
        
        const enemyPanel = this.uiManager.getElement('enemyName').parentElement;
        const enemyRect = enemyPanel.getBoundingClientRect();
        const enemyCenterX = enemyRect.left + enemyRect.width / 2;
        const enemyCenterY = enemyRect.top + enemyRect.height / 2;
        
        this.particleSystem.createParticles(cardCenterX, cardCenterY, enemyCenterX, enemyCenterY, card.type);
        
        // 延迟应用卡牌效果
        setTimeout(() => {
            // 应用卡牌效果
            const message = this.gameState.applyCardEffects(card);
            
            // 从手牌中移除卡牌
            state.hand.splice(cardIndex, 1);
            
            // 检查敌人是否被击败
            if (state.currentEnemy.hp <= 0) {
                setTimeout(() => {
                    this.handleEnemyDefeated();
                }, 1000);
            }
            
            // 更新UI
            this.uiManager.showEnemyAction(message);
            this.updateUI();
        }, 300);
    }

    // 处理敌人攻击
    enemyAttack() {
        // 显示敌人攻击动画
        this.uiManager.showEnemyAttackAnimation();
        
        // 获取敌人和玩家位置
        const enemyPanel = this.uiManager.getElement('enemyName').parentElement;
        const enemyRect = enemyPanel.getBoundingClientRect();
        const enemyCenterX = enemyRect.left + enemyRect.width / 2;
        const enemyCenterY = enemyRect.top + enemyRect.height / 2;
        
        const hpCard = this.uiManager.getElement('hpValue').parentElement;
        const hpRect = hpCard.getBoundingClientRect();
        const hpCenterX = hpRect.left + hpRect.width / 2;
        const hpCenterY = hpRect.top + hpRect.height / 2;
        
        // 创建敌人攻击粒子效果
        this.particleSystem.createEnemyAttackParticles(enemyCenterX, enemyCenterY, hpCenterX, hpCenterY);
        
        // 屏幕震动效果
        const damage = this.gameState.state.currentEnemy.attack;
        const shakeIntensity = Math.min(damage * 2, 20);
        this.particleSystem.shakeScreen(shakeIntensity, 400);
        
        // 延迟应用伤害，让粒子先飞一会儿
        setTimeout(() => {
            // 应用敌人攻击
            const damage = this.gameState.enemyAttack();
            
            // 显示敌人动作
            const message = `${this.gameState.state.currentEnemy.name}对你造成了${damage}点伤害！`;
            this.uiManager.showEnemyAction(message);
            
            // 显示HP伤害效果
            this.uiManager.showHpDamageEffect();
            
            // 检查游戏是否结束
            const gameOverMessage = this.gameState.isGameOver();
            if (gameOverMessage) {
                this.uiManager.showGameOver(gameOverMessage);
            }
            
            // 更新UI
            this.updateUI();
        }, 300);
    }

    // 处理敌人被击败
    handleEnemyDefeated() {
        const rewardText = this.gameState.handleEnemyDefeated();
        this.uiManager.showLevelUp(rewardText);
        
        // 检查游戏是否结束
        const gameOverMessage = this.gameState.isGameOver();
        if (gameOverMessage) {
            setTimeout(() => {
                this.uiManager.showGameOver(gameOverMessage);
            }, 1000);
        } else {
            // 显示选路界面
            setTimeout(() => {
                this.showPathSelection();
            }, 1500);
        }
    }

    // 触发随机事件
    triggerEvent() {
        const state = this.gameState.getState();
        const randomEvent = state.events[Math.floor(Math.random() * state.events.length)];
        
        this.uiManager.showEvent(randomEvent, (effects) => {
            this.gameState.applyEventEffects(effects);
            this.updateUI();
        });
    }

    // 显示选路界面
    showPathSelection() {
        const nextNodes = this.mapManager.getNextNodes();
        if (nextNodes.length > 0) {
            // 强制显示地图容器
            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
                mapContainer.style.display = 'block';
                mapContainer.classList.remove('hidden');
            }
            
            // 确保地图UI初始化
            if (!this.mapUI.mapContainer) {
                this.mapUI.init('map-container', (nodeId) => this.handlePathSelect(nodeId));
            }
            
            // 渲染地图树形图
            this.mapUI.render(
                this.mapManager.getMapData(),
                this.mapManager.getCurrentPath(),
                this.mapManager.getUnlockedNodes()
            );
            
            // 隐藏休息按钮，因为在选路界面
            this.uiManager.setRestButtonVisible(false);
            
            // 显示选路面板
            this.mapUI.showPathSelection(nextNodes, (nodeId) => {
                this.handlePathSelect(nodeId);
            });
        }
    }

    // 处理路径选择
    handlePathSelect(nodeId) {
        if (this.mapManager.selectPath(nodeId)) {
            // 检查是否有事件
            const currentNode = this.mapManager.getCurrentNode();
            if (currentNode.event) {
                this.uiManager.showEvent(currentNode.event, (effects) => {
                    this.gameState.applyEventEffects(effects);
                    this.startNextLevel();
                });
            } else {
                this.startNextLevel();
            }
        }
    }

    // 开始下一关
    startNextLevel() {
        // 从地图获取当前节点的敌人
        const currentNode = this.mapManager.getCurrentNode();
        this.gameState.startLevel(currentNode.enemy);
        this.updateUI();
    }

    // 更新UI
    updateUI() {
        const state = this.gameState.getState();
        this.uiManager.updateStats(state);
        
        // 根据当前关卡类型控制UI
        const currentNode = this.mapManager.getCurrentNode();
        const isRestNode = currentNode && currentNode.type === 'rest';
        
        if (isRestNode) {
            // 休息关：不显示卡牌
            this.uiManager.updateCards([], () => {});
            
            // 休息关：隐藏敌人面板
            const enemyPanel = document.querySelector('.enemy-panel');
            if (enemyPanel) {
                enemyPanel.style.display = 'none';
            }
            
            // 休息关：显示休息按钮和下一关按钮
            this.uiManager.setRestButtonVisible(true);
            this.uiManager.setRestButtonEnabled(!state.restButtonUsed);
            this.uiManager.getElement('endTurnBtn').style.display = 'none';
            this.uiManager.getElement('nextLevelBtn').style.display = 'inline-block';
            
            // 隐藏卡牌区域
            const cardArea = document.querySelector('.card-area');
            if (cardArea) {
                cardArea.style.display = 'none';
            }
            
            // 休息关：修改游戏区域标题
            const playerPanel = document.querySelector('.player-panel h2');
            if (playerPanel) {
                playerPanel.textContent = '休息区';
            }
            
            // 休息关：显示休息提示
            const playerInfo = document.querySelector('.player-info');
            if (playerInfo) {
                // 检查是否已存在休息提示
                let restHint = document.getElementById('rest-hint');
                if (!restHint) {
                    restHint = document.createElement('div');
                    restHint.id = 'rest-hint';
                    restHint.style.cssText = `
                        margin-top: 20px;
                        padding: 15px;
                        background-color: #e8f4f8;
                        border-radius: 8px;
                        text-align: center;
                    `;
                    restHint.innerHTML = `
                        <h3 style="color: #2c3e50; margin-bottom: 10px;">🎉 休息区</h3>
                        <p style="color: #34495e; margin: 5px 0;">所有状态已回满！</p>
                        <p style="color: #7f8c8d; font-size: 0.9em;">点击"休息"按钮可以再次恢复状态</p>
                        <p style="color: #7f8c8d; font-size: 0.9em;">点击"下一关"按钮继续冒险</p>
                    `;
                    playerInfo.appendChild(restHint);
                }
            }
        } else {
            // 普通关卡：显示卡牌
            this.uiManager.updateCards(state.hand, (index, cardElement, card) => {
                this.handleCardClick(index, cardElement, card);
            });
            this.uiManager.updateEnemy(state.currentEnemy, state.enemies, state.level);
            
            // 显示敌人面板
            const enemyPanel = document.querySelector('.enemy-panel');
            if (enemyPanel) {
                enemyPanel.style.display = 'block';
            }
            
            // 普通关卡：隐藏休息按钮和下一关按钮，显示结束回合按钮
            this.uiManager.setRestButtonVisible(false);
            this.uiManager.getElement('endTurnBtn').style.display = 'inline-block';
            this.uiManager.getElement('nextLevelBtn').style.display = 'none';
            
            // 显示卡牌区域
            const cardArea = document.querySelector('.card-area');
            if (cardArea) {
                cardArea.style.display = 'block';
            }
            
            // 普通关卡：恢复游戏区域标题
            const playerPanel = document.querySelector('.player-panel h2');
            if (playerPanel) {
                playerPanel.textContent = '你的角色';
            }
            
            // 普通关卡：移除休息提示
            const restHint = document.getElementById('rest-hint');
            if (restHint) {
                restHint.remove();
            }
        }
    }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
    // 设置开始界面按钮事件
    setupStartScreen();
    
    // 延迟初始化，确保DOM完全加载
    setTimeout(() => {
        new Game();
    }, 100);
});

// 设置开始界面
function setupStartScreen() {
    const startBtn = document.getElementById('start-btn');
    const aboutBtn = document.getElementById('about-btn');
    const exitBtn = document.getElementById('exit-btn');
    const closeAboutBtn = document.getElementById('close-about-btn');
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.getElementById('game-container');
    const aboutModal = document.getElementById('about-modal');
    
    // 开始游戏按钮
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startScreen.style.display = 'none';
            gameContainer.classList.remove('hidden');
            gameContainer.style.display = 'block';
        });
    }
    
    // 关于我们按钮
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            aboutModal.classList.remove('hidden');
        });
    }
    
    // 退出按钮
    if (exitBtn) {
        exitBtn.addEventListener('click', () => {
            if (confirm('确定要退出游戏吗？')) {
                window.close();
            }
        });
    }
    
    // 关闭关于我们弹窗
    if (closeAboutBtn) {
        closeAboutBtn.addEventListener('click', () => {
            aboutModal.classList.add('hidden');
        });
    }
}