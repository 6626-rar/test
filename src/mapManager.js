// 地图管理模块

import { enemies, events } from './config.js';

class MapManager {
    constructor() {
        this.mapData = null;
        this.currentPath = [];
        this.unlockedNodes = new Set();
        this.initMap();
    }

    // 初始化地图
    initMap() {
        this.mapData = this.generateMap();
        this.currentPath = [0]; // 从起点开始
        this.unlockedNodes.add(0);
    }

    // 生成地图
    generateMap() {
        const map = {
            nodes: [],
            edges: []
        };

        // 第一层节点（1-8关）
        const layer1Nodes = this.generateLayerNodes(0, 8, 1);
        // 第二层节点（9-16关）
        const layer2Nodes = this.generateLayerNodes(8, 8, 2);

        map.nodes = [...layer1Nodes, ...layer2Nodes];
        map.edges = this.generateEdges(map.nodes);

        return map;
    }

    // 生成一层节点
    generateLayerNodes(startIndex, count, layer) {
        const nodes = [];
        
        for (let i = 0; i < count; i++) {
            const nodeIndex = startIndex + i;
            const enemyIndex = nodeIndex;
            const enemy = enemies[enemyIndex];
            
            // 检查是否是休息关或BOSS关
            let nodeType = 'normal';
            if (enemy.name === '休息') {
                nodeType = 'rest';
            } else if (enemy.name.includes('论文')) {
                nodeType = 'boss';
            }

            // 随机决定是否有事件
            const hasEvent = Math.random() > 0.5 && nodeType !== 'boss';
            const event = hasEvent ? events[Math.floor(Math.random() * events.length)] : null;

            nodes.push({
                id: nodeIndex,
                enemy: enemy,
                type: nodeType,
                event: event,
                layer: layer,
                x: layer * 300,
                y: 100 + i * 80
            });
        }

        return nodes;
    }

    // 生成边
    generateEdges(nodes) {
        const edges = [];
        const layer1Nodes = nodes.slice(0, 8);
        const layer2Nodes = nodes.slice(8, 16);

        // 第一层路径：起点 -> 第1关 -> 分支 -> 休息关 -> BOSS关
        // 路径1: 0 -> 1 -> 3 -> 6 -> 7
        edges.push({ from: 0, to: 1 });
        edges.push({ from: 1, to: 3 });
        edges.push({ from: 3, to: 6 });
        edges.push({ from: 6, to: 7 });

        // 路径2: 0 -> 2 -> 4 -> 6 -> 7
        edges.push({ from: 0, to: 2 });
        edges.push({ from: 2, to: 4 });
        edges.push({ from: 4, to: 6 });

        // 路径3: 0 -> 2 -> 5 -> 6 -> 7
        edges.push({ from: 2, to: 5 });
        edges.push({ from: 5, to: 6 });

        // 第二层路径：第一层BOSS -> 第9关 -> 分支 -> 休息关 -> BOSS关
        // 路径1: 7 -> 9 -> 11 -> 14 -> 15
        edges.push({ from: 7, to: 9 });
        edges.push({ from: 9, to: 11 });
        edges.push({ from: 11, to: 14 });
        edges.push({ from: 14, to: 15 });

        // 路径2: 7 -> 10 -> 12 -> 14 -> 15
        edges.push({ from: 7, to: 10 });
        edges.push({ from: 10, to: 12 });
        edges.push({ from: 12, to: 14 });

        // 路径3: 7 -> 10 -> 13 -> 14 -> 15
        edges.push({ from: 10, to: 13 });
        edges.push({ from: 13, to: 14 });

        return edges;
    }

    // 获取当前节点
    getCurrentNode() {
        const currentNodeId = this.currentPath[this.currentPath.length - 1];
        return this.mapData.nodes.find(node => node.id === currentNodeId);
    }

    // 获取下一个可选节点
    getNextNodes() {
        const currentNodeId = this.currentPath[this.currentPath.length - 1];
        const nextNodeIds = this.mapData.edges
            .filter(edge => edge.from === currentNodeId)
            .map(edge => edge.to);

        return nextNodeIds.map(id => this.mapData.nodes.find(node => node.id === id));
    }

    // 选择路径
    selectPath(nextNodeId) {
        const currentNodeId = this.currentPath[this.currentPath.length - 1];
        const isValidPath = this.mapData.edges.some(edge => edge.from === currentNodeId && edge.to === nextNodeId);

        if (isValidPath) {
            this.currentPath.push(nextNodeId);
            this.unlockedNodes.add(nextNodeId);
            return true;
        }
        return false;
    }

    // 检查是否到达BOSS关
    isBossNode(nodeId) {
        const node = this.mapData.nodes.find(node => node.id === nodeId);
        return node && node.type === 'boss';
    }

    // 检查是否到达休息关
    isRestNode(nodeId) {
        const node = this.mapData.nodes.find(node => node.id === nodeId);
        return node && node.type === 'rest';
    }

    // 获取地图数据
    getMapData() {
        return this.mapData;
    }

    // 获取当前路径
    getCurrentPath() {
        return this.currentPath;
    }

    // 获取已解锁节点
    getUnlockedNodes() {
        return this.unlockedNodes;
    }

    // 重置地图
    reset() {
        this.initMap();
    }
}

export default MapManager;