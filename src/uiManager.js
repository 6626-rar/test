// UI管理

class UIManager {
    constructor() {
        this.elements = {
            // 状态条
            hpFill: document.getElementById('hp-fill'),
            hpValue: document.getElementById('hp-value'),
            knFill: document.getElementById('kn-fill'),
            knValue: document.getElementById('kn-value'),
            focusFill: document.getElementById('focus-fill'),
            focusValue: document.getElementById('focus-value'),
            // 敌人信息
            enemyName: document.getElementById('enemy-name'),
            enemyHpFill: document.getElementById('enemy-hp-fill'),
            enemyHpText: document.getElementById('enemy-hp-text'),
            enemyAvatar: document.getElementById('enemy-avatar'),
            // 卡牌
            cardsContainer: document.getElementById('cards-container'),
            // 按钮
            endTurnBtn: document.getElementById('end-turn-btn'),
            restartBtn: document.getElementById('restart-btn'),
            continueBtn: document.getElementById('continue-btn'),
            restBtn: document.getElementById('rest-btn'),
            nextLevelBtn: document.getElementById('next-level-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            // 堆计数
            deckCount: document.getElementById('deck-count'),
            discardCount: document.getElementById('discard-count'),
            discardIcon: document.getElementById('discard-icon'),
            // 头像
            playerAvatarCard: document.querySelector('.player-avatar-card'),
            // 行动点数
            actionPoints: document.getElementById('action-points'),
            // CMD面板
            cmdPortrait: document.getElementById('cmd-portrait'),
            cmdLabel: document.getElementById('cmd-label'),
            cmdDesc: document.getElementById('cmd-desc'),
            cmdCardName: document.getElementById('cmd-card-name'),
            cmdCost: document.getElementById('cmd-cost'),
            // 模态框
            gameOverModal: document.getElementById('game-over-modal'),
            gameOverText: document.getElementById('game-over-text'),
            levelUpModal: document.getElementById('level-up-modal'),
            levelUpText: document.getElementById('level-up-text'),
            eventPanel: document.getElementById('event-panel'),
            eventText: document.getElementById('event-text'),
            eventOptions: document.getElementById('event-options')
        };
    }

    // 更新状态显示
    updateStats(state) {
        const hpPercent = Math.max(0, Math.min(100, (state.hp / state.maxHp) * 100));
        this.elements.hpFill.style.width = `${hpPercent}%`;
        this.elements.hpValue.textContent = `${state.hp}/${state.maxHp}`;
        
        const knPercent = Math.max(0, Math.min(100, state.kn));
        this.elements.knFill.style.width = `${knPercent}%`;
        this.elements.knValue.textContent = state.kn;
        
        const focusPercent = Math.max(0, Math.min(100, (state.focus / 10) * 100));
        this.elements.focusFill.style.width = `${focusPercent}%`;
        this.elements.focusValue.textContent = state.focus;
        
        this.elements.actionPoints.textContent = `${state.energy}/${state.maxEnergy}`;
        
        this.elements.deckCount.textContent = state.deck.length;
        this.elements.discardCount.textContent = state.discard.length;
        
        if (state.discard.length > 0) {
            this.elements.discardIcon.classList.add('full');
        } else {
            this.elements.discardIcon.classList.remove('full');
        }
        
        const kn = state.kn;
        let avatarSrc = './resource/hp_high.png';
        if (kn > 30 && kn <= 60) {
            avatarSrc = './resource/hp_middle.png';
        } else if (kn > 60 && kn <= 90) {
            avatarSrc = './resource/hp_low.png';
        }
        if (this.elements.playerAvatarCard) {
            this.elements.playerAvatarCard.style.backgroundImage = `url('${avatarSrc}')`;
        }
    }
    
    // 更新完成度进度条
    updateProgress(progress) {
        const completionFill = document.getElementById('completion-fill');
        if (completionFill) {
            completionFill.style.width = `${progress}%`;
        }
    }

    // 更新卡牌显示
    updateCards(hand, onCardClick) {
        this.elements.cardsContainer.innerHTML = '';
        
        hand.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.innerHTML = `
                <div class="rope-bottom"></div>
                <div class="ring"></div>
                <div class="rope-top"></div>
                <div class="card-portrait">
                    <img src="resource/card/${this.getCardImage(card.name)}.png" alt="${card.name}">
                </div>
            `;
            
            let lastClickTime = 0;
            cardElement.addEventListener('click', (e) => {
                const currentTime = new Date().getTime();
                const timeSinceLastClick = currentTime - lastClickTime;
                
                if (timeSinceLastClick < 300) {
                    onCardClick(index, cardElement, card);
                }
                
                lastClickTime = currentTime;
            });
            
            cardElement.addEventListener('mouseenter', () => {
                this.showCardDetail(card);
            });
            
            this.elements.cardsContainer.appendChild(cardElement);
        });
    }

    // 获取卡牌图片名称
    getCardImage(cardName) {
        const imageMap = {
            '闭目': 'closeeye',
            '鼠标点击': 'mouse',
            '咖啡': 'coffe',
            '时间管理': 'timemanager',
            '操作': 'operate',
            '疯狂': 'crazy',
            '拖延': 'putoff'
        };
        return imageMap[cardName] || 'coffe';
    }

    // 显示卡牌详情到CMD窗口
    showCardDetail(card) {
        const imgSrc = `resource/card/${this.getCardImage(card.name)}.png`;
        this.elements.cmdPortrait.innerHTML = `<img src="${imgSrc}" alt="${card.name}">`;
        
        this.elements.cmdLabel.textContent = `${card.name}:`;
        
        const effectDescriptions = {
            attack: (value) => `对敌人造成${value}点伤害`,
            hp: (value) => value > 0 ? `恢复${value}点生命` : `失去${Math.abs(value)}点生命`,
            kn: (value) => value > 0 ? `困意+${value}` : `困意-${Math.abs(value)}`,
            focus: (value) => value > 0 ? `专注+${value}` : `专注-${Math.abs(value)}`,
            energy: (value) => value > 0 ? `精力+${value}` : `精力-${Math.abs(value)}`
        };
        
        const effectsText = Object.entries(card.effects).map(([key, value]) => {
            return effectDescriptions[key] ? effectDescriptions[key](value) : `${key}: ${value}`;
        }).join('，');
        
        this.elements.cmdDesc.textContent = effectsText + '_';
        this.elements.cmdCardName.textContent = `!${card.name}`;
        this.elements.cmdCost.textContent = `◇${card.cost}`;
    }

    // 清空CMD窗口显示
    clearCardDetail() {
        this.elements.cmdPortrait.innerHTML = '<span class="empty-portrait">?</span>';
        this.elements.cmdLabel.textContent = '选择卡牌:';
        this.elements.cmdDesc.textContent = '点击卡牌查看详情_';
        this.elements.cmdCardName.textContent = '-';
        this.elements.cmdCost.textContent = '-';
    }

    // 更新敌人显示
    updateEnemy(currentEnemy, enemies, level) {
        if (currentEnemy) {
            this.elements.enemyName.textContent = currentEnemy.name;
            
            const maxHp = enemies.find(enemy => enemy.name === currentEnemy.name)?.hp || currentEnemy.hp;
            const hpPercent = Math.max(0, Math.min(100, (currentEnemy.hp / maxHp) * 100));
            this.elements.enemyHpFill.style.width = `${hpPercent}%`;
            this.elements.enemyHpText.textContent = `HP: ${currentEnemy.hp}/${maxHp}`;
            
            // 设置敌人头像
            const enemyAvatar = this.elements.enemyAvatar;
            if (enemyAvatar) {
                enemyAvatar.classList.remove('book', 'essay');
                if (currentEnemy.name.includes('书本') || currentEnemy.name.includes('书')) {
                    enemyAvatar.classList.add('book');
                } else if (currentEnemy.name.includes('论文') || currentEnemy.name.includes('Essay')) {
                    enemyAvatar.classList.add('essay');
                }
            }
        }
    }

    // 显示敌人动作
    showEnemyAction(message) {
        console.log('Enemy action:', message);
    }

    // 显示事件面板
    showEvent(event, onOptionSelect) {
        this.elements.eventText.textContent = event.text;
        this.elements.eventOptions.innerHTML = '';
        
        event.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'btn btn-primary';
            button.textContent = option.text;
            button.addEventListener('click', () => {
                onOptionSelect(option.effects);
                this.hideEvent();
            });
            this.elements.eventOptions.appendChild(button);
        });
        
        if (window.modalManager) {
            window.modalManager.open('event-panel', {
                ariaLabel: '随机事件',
                ariaDescribedBy: 'event-text'
            });
        } else {
            this.elements.eventPanel.classList.remove('hidden');
        }
    }

    // 隐藏事件面板
    hideEvent() {
        if (window.modalManager) {
            window.modalManager.close('event-panel');
        } else {
            this.elements.eventPanel.classList.add('hidden');
        }
    }

    // 显示游戏结束模态框
    showGameOver(text) {
        this.elements.gameOverText.textContent = text;
        if (window.modalManager) {
            window.modalManager.open('game-over-modal', {
                ariaLabel: '游戏结束',
                ariaDescribedBy: 'game-over-text'
            });
        } else {
            this.elements.gameOverModal.classList.remove('hidden');
        }
    }

    // 隐藏游戏结束模态框
    hideGameOver() {
        if (window.modalManager) {
            window.modalManager.close('game-over-modal');
        } else {
            this.elements.gameOverModal.classList.add('hidden');
        }
    }

    // 显示关卡完成模态框
    showLevelUp(text) {
        this.elements.levelUpText.textContent = text;
        if (window.modalManager) {
            window.modalManager.open('level-up-modal', {
                ariaLabel: '关卡完成',
                ariaDescribedBy: 'level-up-text'
            });
        } else {
            this.elements.levelUpModal.classList.remove('hidden');
        }
    }

    // 隐藏关卡完成模态框
    hideLevelUp() {
        if (window.modalManager) {
            window.modalManager.close('level-up-modal');
        } else {
            this.elements.levelUpModal.classList.add('hidden');
        }
    }

    // 显示敌人攻击动画
    showEnemyAttackAnimation() {
        console.log('Enemy attacking...');
    }

    // 显示HP伤害效果
    showHpDamageEffect() {
        console.log('HP damage effect');
    }

    // 绑定事件监听器
    bindEventListeners(handlers) {
        this.elements.endTurnBtn.addEventListener('click', handlers.onEndTurn);
        this.elements.restartBtn.addEventListener('click', handlers.onRestart);
        this.elements.continueBtn.addEventListener('click', handlers.onContinue);
        if (this.elements.restBtn) {
            this.elements.restBtn.addEventListener('click', handlers.onRest);
        }
        if (this.elements.nextLevelBtn) {
            this.elements.nextLevelBtn.addEventListener('click', handlers.onNextLevel);
        }
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener('click', handlers.onPause);
        }
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', handlers.onReset);
        }
    }

    // 设置休息按钮可见性
    setRestButtonVisible(visible) {
        if (this.elements.restBtn) {
            this.elements.restBtn.style.display = visible ? 'inline-block' : 'none';
        }
    }

    // 设置休息按钮可用性
    setRestButtonEnabled(enabled) {
        if (this.elements.restBtn) {
            this.elements.restBtn.disabled = !enabled;
            this.elements.restBtn.style.opacity = enabled ? '1' : '0.5';
        }
    }

    // 获取元素
    getElement(key) {
        return this.elements[key];
    }
}

export default UIManager;