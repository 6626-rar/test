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
    restButtonUsed: false // 标记休息按钮是否已使用
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
        for (let i = 0; i < count; i++) {
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
            this.state.currentEnemy = { ...enemy };
            this.state.energy = this.state.maxEnergy;
            this.state.restButtonUsed = false; // 重置休息按钮状态
            
            // 检查是否是休息关
            if (enemy.name === '休息') {
                // 休息关：回满所有状态
                this.state.kn = 0; // 困意回满
                this.state.hp = this.state.maxHp; // HP回满
                this.state.energy = this.state.maxEnergy; // 精力回满
            }
            
            // 检查牌库是否足够抽卡
            if (this.state.deck.length < 5) {
                // 牌库为空，从弃牌堆重新洗牌
                this.state.deck = [...this.state.discard];
                this.state.discard = [];
                this.shuffleDeck();
            }
            
            // 玩家回合开始，抽卡
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
            this.state.kn = Math.max(0, this.state.kn + effects.kn);
        }
        
        if (effects.focus) {
            this.state.focus = Math.max(0, this.state.focus + effects.focus);
         
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
        this.state.kn += 5;
        
        // 恢复精力
        this.state.energy = this.state.maxEnergy;
        
        // 清空手牌
        this.state.discard.push(...this.state.hand);
        this.state.hand = [];
        
        // 检查牌库是否足够抽卡
        if (this.state.deck.length < 5) {
            // 牌库为空，从弃牌堆重新洗牌
            this.state.deck = [...this.state.discard];
            this.state.discard = [];
            this.shuffleDeck();
        }
        
        // 玩家回合开始，抽卡
        this.drawCards(5);
        
        return damage;
    }

    // 处理敌人被击败
    handleEnemyDefeated() {
        const reward = this.state.currentEnemy.reward;
        let rewardText = `你击败了${this.state.currentEnemy.name}！`;
        
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
