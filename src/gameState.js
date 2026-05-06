// 游戏状态管理

import { enemies, events, cards } from './config.js';

// 初始游戏状态
const initialState = {
    kn: 0,
    focus: 2,
    energy: 3,
    maxEnergy: 3,
    hp: 100,
    maxHp: 100,
    level: 1,
    deck: [],
    hand: [],
    discard: [],
    currentEnemy: null,
    enemies: enemies,
    events: events,
    cards: cards,
    restButtonUsed: false, // 标记休息按钮是否已使用
    defeatedEnemies: 0, // 击败的敌人数量
    defeatedBosses: 0 // 击败的BOSS数量
};

class GameState {
    constructor() {
        this.state = { ...initialState };
    }

    // 重置游戏状态
    reset() {
        this.state = { ...initialState };
    }

    // 获取当前状态
    getState() {
        return this.state;
    }

    // 更新状态
    updateState(newState) {
        this.state = { ...this.state, ...newState };
    }

    // 洗牌
    shuffleDeck() {
        const deck = this.state.deck;
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    // 抽卡
    drawCards(count) {
        const maxHandSize = 8; // 手牌上限
        
        for (let i = 0; i < count; i++) {
            // 检查手牌是否已达上限
            if (this.state.hand.length >= maxHandSize) {
                break;
            }
            
            if (this.state.deck.length === 0) {
                // 牌库为空，从弃牌堆重新洗牌
                this.state.deck = [...this.state.discard];
                this.state.discard = [];
                this.shuffleDeck();
            }
            
            if (this.state.deck.length > 0) {
                const card = this.state.deck.pop();
                this.state.hand.push(card);
            }
        }
    }

    // 开始关卡
    startLevel(enemy) {
        if (enemy) {
            // 重置休息按钮状态（每次进入新关卡都重置）
            this.state.restButtonUsed = false;
            
            this.state.currentEnemy = { ...enemy };
            this.state.energy = this.state.maxEnergy;
            
            // 检查是否是休息关
            if (enemy.name === '休息') {
                // 休息关：回满所有状态
                this.state.kn = 0; // 困意回满
                this.state.hp = this.state.maxHp; // HP回满
                this.state.energy = this.state.maxEnergy; // 精力回满
                // 休息关不抽卡
                return;
            }
            
            // 玩家回合开始，抽卡（drawCards内部会处理牌库为空的情况）
            this.drawCards(5);
        }
    }

    // 应用事件效果
    applyEventEffects(effects) {
        if (effects.kn) this.state.kn = Math.max(0, this.state.kn + effects.kn);
        if (effects.focus) {
            this.state.focus = Math.max(0, this.state.focus + effects.focus);
            // 专注增加时恢复HP
            if (effects.focus > 0) {
                this.state.hp = Math.min(this.state.maxHp, this.state.hp + effects.focus * 2);
            }
        }
        if (effects.hp) this.state.hp = Math.min(this.state.maxHp, this.state.hp + effects.hp);
        if (effects.cards) {
            // 随机获得卡牌
            for (let i = 0; i < effects.cards; i++) {
                const randomCard = this.state.cards[Math.floor(Math.random() * this.state.cards.length)];
                this.state.deck.push({ ...randomCard });
            }
            this.shuffleDeck();
        }
    }

    // 应用卡牌效果
    applyCardEffects(card) {
        const effects = card.effects;
        let message = '';
        
        if (effects.attack) {
            const damage = effects.attack + this.state.focus;
            this.state.currentEnemy.hp -= damage;
            message = `你对${this.state.currentEnemy.name}造成了${damage}点伤害！`;
        }
        
        if (effects.hp) {
            // 根据专注值增加回复量
            const totalHeal = effects.hp + this.state.focus;
            this.state.hp = Math.min(this.state.maxHp, this.state.hp + totalHeal);
            message = `你恢复了${totalHeal}点HP！`;
        }
        
        if (effects.kn) {
            this.state.kn = Math.max(0, Math.min(100, this.state.kn + effects.kn));
        }
        
        if (effects.focus) {
            this.state.focus = Math.max(0, Math.min(50, this.state.focus + effects.focus));
        }
        
        if (effects.energy) {
            this.state.energy = Math.min(this.state.maxEnergy, this.state.energy + effects.energy);
        }
        
        // 消耗精力
        this.state.energy -= card.cost;
        
        // 将卡牌加入弃牌堆
        this.state.discard.push(card);
        
        return message;
    }

    // 敌人攻击
    enemyAttack() {
        const damage = this.state.currentEnemy.attack;
        this.state.hp -= damage;
        
        // 每回合增加困意
        this.state.kn = Math.min(100, this.state.kn + 5);
        
        // 恢复精力
        this.state.energy = this.state.maxEnergy;
        
        // 清空手牌到弃牌堆
        this.state.discard.push(...this.state.hand);
        this.state.hand = [];
        
        // 玩家回合开始，抽卡（drawCards内部会处理牌库为空的情况）
        this.drawCards(5);
        
        return damage;
    }

    // 处理敌人被击败
    handleEnemyDefeated() {
        const enemyName = this.state.currentEnemy.name;
        const reward = this.state.currentEnemy.reward;
        let rewardText = `你击败了${enemyName}！`;
        
        // 增加击败敌人计数（排除休息关）
        if (enemyName !== '休息') {
            this.state.defeatedEnemies++;
            
            // 判断是否是BOSS
            if (enemyName.includes('论文') || enemyName.includes('BOSS')) {
                this.state.defeatedBosses++;
            }
        }
        
        if (reward.cards) {
            rewardText += `\n获得了${reward.cards}张卡牌！`;
            // 随机获得卡牌
            for (let i = 0; i < reward.cards; i++) {
                const randomCard = this.state.cards[Math.floor(Math.random() * this.state.cards.length)];
                this.state.deck.push({ ...randomCard });
            }
            this.shuffleDeck();
        }
        
        if (reward.focus) {
            this.state.focus += reward.focus;
            rewardText += `\n专注+${reward.focus}！`;
            // 专注增加时恢复HP
            this.state.hp = Math.min(this.state.maxHp, this.state.hp + reward.focus * 2);
            rewardText += `\nHP+${reward.focus * 2}！`;
        }
        
        if (reward.kn) {
            this.state.kn = Math.max(0, this.state.kn + reward.kn);
            rewardText += `\n困意${reward.kn > 0 ? '+' : ''}${reward.kn}！`;
        }
        
        this.state.level++;
        
        return rewardText;
    }
    
    // 获取完成度百分比
    getProgress() {
        const state = this.state;
        
        // 击败BOSS时增加50%
        const bossProgress = state.defeatedBosses * 50;
        
        // 如果还没有击败任何BOSS，按击败敌人数量计算
        if (state.defeatedBosses === 0) {
            // 第一层有6个普通敌人 + 1个BOSS = 7个节点
            const maxNormalEnemies = 6;
            const progressPerEnemy = 50 / maxNormalEnemies;
            const enemyProgress = Math.min(state.defeatedEnemies * progressPerEnemy, 50);
            return Math.round(enemyProgress);
        } else if (state.defeatedBosses === 1) {
            // 击败第一个BOSS后，进入第二层，继续计算到100%
            // 第二层也有6个普通敌人 + 1个BOSS = 7个节点
            // 已经击败的敌人中，减去第一层的6个普通敌人
            const secondLayerEnemies = Math.max(0, state.defeatedEnemies - 6);
            const maxSecondLayerEnemies = 6;
            const progressPerEnemy = 50 / maxSecondLayerEnemies;
            const secondLayerProgress = Math.min(secondLayerEnemies * progressPerEnemy, 50);
            return Math.round(50 + secondLayerProgress);
        } else {
            // 击败所有BOSS，完成度100%
            return 100;
        }
    }

    // 休息
    rest() {
        this.state.kn = Math.max(0, this.state.kn - 20);
        this.state.hp = Math.min(this.state.maxHp, this.state.hp + 10);
    }

    // 检查游戏是否结束
    isGameOver() {
        if (this.state.hp <= 0) {
            return "你在图书馆熬夜过度，昏倒了！";
        }
        
        if (this.state.kn >= 100) {
            return "你太困了，睡着了！";
        }
        
        if (this.state.level > this.state.enemies.length) {
            return "恭喜你完成了所有论文！";
        }
        
        return null;
    }
}

export default GameState;