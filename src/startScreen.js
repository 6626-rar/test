class StartScreen {
    constructor(onStart) {
        this.onStart = onStart;
        this.startScreen = document.getElementById('start-screen');
        this.startBtn = document.getElementById('start-btn');
        this.aboutBtn = document.getElementById('about-btn');
        this.exitBtn = document.getElementById('exit-btn');
        
        this.bindEventListeners();
    }
    
    bindEventListeners() {
        this.startBtn.addEventListener('click', () => this.handleStart());
        this.aboutBtn.addEventListener('click', () => this.showAbout());
        this.exitBtn.addEventListener('click', () => this.handleExit());
    }
    
    handleStart() {
        if (this.onStart) {
            setTimeout(() => {
                this.onStart();
            }, 300);
        }
    }
    
    showAbout() {
        alert('图书馆熬夜大作战 - 卡牌肉鸽游戏\n\n这是一款模拟大学生在图书馆熬夜赶论文的卡牌游戏。\n\n游戏特色：\n• 卡牌战斗系统\n• 困意机制\n• 随机事件\n• 策略选择\n\n祝你好运，完成论文！');
    }
    
    handleExit() {
        if (confirm('确定要退出游戏吗？')) {
            window.close();
        }
    }
}

export default StartScreen;
