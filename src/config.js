// 游戏配置

// 敌人列表
export const enemies = [
    // 第一层
    { name: "弹窗", hp: 10, attack: 3, reward: { cards: 1 } },
    { name: "鼠标", hp: 15, attack: 4, reward: { cards: 1 } },
    { name: "任务文件", hp: 20, attack: 5, reward: { cards: 1, focus: 2, kn: 10 } },
    { name: "浏览器", hp: 25, attack: 6, reward: { cards: 2 } },
    { name: "放大镜", hp: 30, attack: 7, reward: { cards: 2 } },
    { name: "文献1", hp: 35, attack: 8, reward: { cards: 2 } },
    { name: "休息", hp: 1, attack: 0, reward: { cards: 1, kn: -20 } },
    { name: "论文第一章", hp: 100, attack: 15, reward: { cards: 4, focus: 2 } },
    // 第二层
    { name: "网站1", hp: 50, attack: 10, reward: { cards: 3 } },
    { name: "游戏机", hp: 55, attack: 11, reward: { cards: 3 } },
    { name: "朋友的问候", hp: 1, attack: 0, reward: { cards: 2 } },
    { name: "文献2", hp: 60, attack: 12, reward: { cards: 3 } },
    { name: "书本1", hp: 65, attack: 13, reward: { cards: 3 } },
    { name: "笔记1", hp: 70, attack: 14, reward: { cards: 3 } },
    { name: "休息", hp: 1, attack: 0, reward: { cards: 2, kn: -15 } },
    { name: "论文第二章", hp: 150, attack: 20, reward: { cards: 5, focus: 3 } }
];

// 事件列表
export const events = [
    {
        name: "朋友来电",
        text: "你的朋友打电话给你，询问你的近况。",
        options: [
            {
                text: "接听",
                effects: { kn: -5, hp: 10, focus: 1 }
            },
            {
                text: "挂断",
                effects: { kn: 10, focus: -1 }
            }
        ]
    },
    {
        name: "父亲来电",
        text: "一个陌生号码来电，可能是你的父亲。",
        options: [
            {
                text: "接听",
                effects: { hp: 20, focus: 1 }
            },
            {
                text: "挂断",
                effects: { kn: -10, focus: 2 }
            }
        ]
    },
    {
        name: "图书馆管理员",
        text: "图书馆管理员正在巡视，你担心被发现熬夜。",
        options: [
            {
                text: "躲藏",
                effects: { cards: 1 }
            },
            {
                text: "不躲藏",
                effects: { focus: 1, kn: -5, cards: 1 }
            }
        ]
    },
    {
        name: "书本选择",
        text: "你在寻找文献时，发现了两本书。",
        options: [
            {
                text: "选择故事书",
                effects: { focus: -1, cards: 1 }
            },
            {
                text: "选择科研报告",
                effects: { focus: 1, hp: 20 }
            }
        ]
    },
    {
        name: "厕所小猫",
        text: "你在上厕所时遇到了一只可爱的小猫。",
        options: [
            {
                text: "拍照",
                effects: { hp: 20, kn: 10 }
            },
            {
                text: "抚摸",
                effects: { hp: 30, kn: 5 }
            }
        ]
    }
];

// 卡牌列表
export const cards = [
    { name: "闭目养神", type: "初始", cost: 1, effects: { hp: 5, kn: -5 } },
    { name: "点击鼠标", type: "初始", cost: 1, effects: { attack: 4 } },
    { name: "咖啡加成", type: "增益", cost: 2, effects: { focus: 2, kn: -10 } },
    { name: "时间管理", type: "增益", cost: 2, effects: { energy: 1, kn: -5 } },
    { name: "导师问候", type: "事件", cost: 3, effects: { attack: 8, hp: 8 } },
    { name: "打起精神", type: "增益", cost: 1, effects: { focus: 1, kn: -5 } },
    { name: "熬夜", type: "增益", cost: 3, effects: { attack: 6, kn: 15 } }
];

// 粒子颜色配置
export const particleColors = {
    '初始': ['rgba(52, 152, 219, 1)', 'rgba(46, 204, 113, 1)'],
    '增益': ['rgba(241, 196, 15, 1)', 'rgba(230, 126, 34, 1)'],
    '事件': ['rgba(155, 89, 182, 1)', 'rgba(231, 76, 60, 1)'],
    'enemy': ['rgba(231, 76, 60, 1)', 'rgba(230, 126, 34, 1)', 'rgba(192, 57, 43, 1)']
};

// 粒子数量配置
export const particleCounts = {
    '初始': 25,
    '增益': 35,
    '事件': 50,
    'enemy': 40
};