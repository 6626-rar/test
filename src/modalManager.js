// 遮罩管理器 - 全面优化版本

class ModalManager {
    constructor() {
        this.modals = new Map();
        this.activeModal = null;
        this.animationDuration = 300;
        
        this.init();
    }

    init() {
        // 绑定全局键盘事件
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // 自动注册页面上已有的模态框
        this.registerExistingModals();
    }

    // 注册页面上已有的模态框
    registerExistingModals() {
        const modalElements = document.querySelectorAll('.modal');
        modalElements.forEach(element => {
            const id = element.id;
            if (id) {
                this.modals.set(id, {
                    element: element,
                    config: this.getDefaultConfig()
                });
                
                // 添加ARIA属性
                this.addAriaAttributes(element);
                
                // 绑定点击外部关闭事件
                element.addEventListener('click', (e) => {
                    if (e.target === element) {
                        this.close(id);
                    }
                });
            }
        });
    }

    // 获取默认配置
    getDefaultConfig() {
        return {
            animate: true,
            closeOnOverlayClick: true,
            closeOnEscape: true,
            focusTrap: true,
            ariaLabel: null,
            ariaDescribedBy: null
        };
    }

    // 添加ARIA属性
    addAriaAttributes(element) {
        element.setAttribute('role', 'dialog');
        element.setAttribute('aria-modal', 'true');
        element.setAttribute('aria-hidden', 'true');
        
        const content = element.querySelector('.modal-content');
        if (content) {
            content.setAttribute('role', 'document');
        }
    }

    // 打开遮罩
    open(modalId, config = {}) {
        const modalData = this.modals.get(modalId);
        if (!modalData) {
            console.warn(`Modal "${modalId}" not found`);
            return;
        }

        const element = modalData.element;
        const mergedConfig = { ...modalData.config, ...config };

        // 关闭当前活动的遮罩
        if (this.activeModal && this.activeModal !== modalId) {
            this.close(this.activeModal);
        }

        // 更新配置
        modalData.config = mergedConfig;

        // 设置ARIA属性
        if (mergedConfig.ariaLabel) {
            element.setAttribute('aria-label', mergedConfig.ariaLabel);
        }
        if (mergedConfig.ariaDescribedBy) {
            element.setAttribute('aria-describedby', mergedConfig.ariaDescribedBy);
        }

        // 显示遮罩
        this.showModal(element, mergedConfig);
        
        this.activeModal = modalId;
    }

    // 显示遮罩（带动画）
    showModal(element, config) {
        // 防止事件穿透
        element.style.pointerEvents = 'auto';
        
        // 移除hidden类
        element.classList.remove('hidden');
        
        // 添加显示动画类
        element.classList.add('modal-enter');
        element.classList.remove('modal-exit');
        
        // 设置aria-hidden为false
        element.setAttribute('aria-hidden', 'false');
        
        // 焦点陷阱
        if (config.focusTrap) {
            this.trapFocus(element);
        }
        
        // 触发自定义事件
        this.dispatchEvent(element, 'modalOpen');
    }

    // 关闭遮罩
    close(modalId) {
        const modalData = this.modals.get(modalId);
        if (!modalData) {
            console.warn(`Modal "${modalId}" not found`);
            return;
        }

        const element = modalData.element;
        
        // 添加退出动画类
        element.classList.add('modal-exit');
        element.classList.remove('modal-enter');
        
        // 设置aria-hidden为true
        element.setAttribute('aria-hidden', 'true');
        
        // 释放焦点陷阱
        this.releaseFocus();
        
        // 动画结束后隐藏
        setTimeout(() => {
            element.classList.add('hidden');
            element.style.pointerEvents = 'none';
            
            // 触发自定义事件
            this.dispatchEvent(element, 'modalClose');
            
            if (this.activeModal === modalId) {
                this.activeModal = null;
            }
        }, this.animationDuration);
    }

    // 切换遮罩状态
    toggle(modalId, config = {}) {
        const modalData = this.modals.get(modalId);
        if (!modalData) return;

        if (modalData.element.classList.contains('hidden')) {
            this.open(modalId, config);
        } else {
            this.close(modalId);
        }
    }

    // 焦点陷阱
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        this.previousFocus = document.activeElement;
        
        setTimeout(() => {
            firstElement.focus();
        }, 50);
        
        // 循环焦点
        lastElement.addEventListener('keydown', this.handleLastElementKeydown.bind(this, firstElement), { once: true });
        firstElement.addEventListener('keydown', this.handleFirstElementKeydown.bind(this, lastElement), { once: true });
    }

    handleFirstElementKeydown(lastElement, e) {
        if (e.key === 'Tab' && e.shiftKey) {
            e.preventDefault();
            lastElement.focus();
            lastElement.addEventListener('keydown', this.handleLastElementKeydown.bind(this, lastElement.previousElementSibling), { once: true });
        }
    }

    handleLastElementKeydown(firstElement, e) {
        if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            firstElement.focus();
            firstElement.addEventListener('keydown', this.handleFirstElementKeydown.bind(this, firstElement.nextElementSibling), { once: true });
        }
    }

    // 释放焦点
    releaseFocus() {
        if (this.previousFocus && this.previousFocus.focus) {
            try {
                this.previousFocus.focus();
            } catch (e) {
                // 忽略焦点错误
            }
        }
        this.previousFocus = null;
    }

    // 键盘事件处理
    handleKeydown(e) {
        if (!this.activeModal) return;

        const modalData = this.modals.get(this.activeModal);
        if (!modalData) return;

        // ESC键关闭
        if (e.key === 'Escape' && modalData.config.closeOnEscape) {
            e.preventDefault();
            this.close(this.activeModal);
        }
    }

    // 触发自定义事件
    dispatchEvent(element, eventName) {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            cancelable: true,
            detail: { modalId: this.activeModal }
        });
        element.dispatchEvent(event);
    }

    // 创建自定义遮罩
    create(options = {}) {
        const defaults = {
            id: `custom-modal-${Date.now()}`,
            title: '',
            content: '',
            buttons: [],
            className: '',
            ...this.getDefaultConfig()
        };

        const config = { ...defaults, ...options };

        // 创建遮罩元素
        const modal = document.createElement('div');
        modal.id = config.id;
        modal.className = `modal hidden ${config.className}`;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-hidden', 'true');

        // 创建内容
        const content = document.createElement('div');
        content.className = 'modal-content';
        content.setAttribute('role', 'document');

        if (config.title) {
            const title = document.createElement('h2');
            title.textContent = config.title;
            content.appendChild(title);
        }

        if (config.content) {
            if (typeof config.content === 'string') {
                content.innerHTML += config.content;
            } else {
                content.appendChild(config.content);
            }
        }

        if (config.buttons.length > 0) {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'modal-buttons';
            
            config.buttons.forEach(btn => {
                const button = document.createElement('button');
                button.className = btn.className || 'btn btn-primary';
                button.textContent = btn.text;
                button.addEventListener('click', () => {
                    if (btn.onClick) btn.onClick();
                    if (btn.closeModal !== false) {
                        this.close(config.id);
                    }
                });
                buttonContainer.appendChild(button);
            });
            
            content.appendChild(buttonContainer);
        }

        modal.appendChild(content);
        document.body.appendChild(modal);

        // 注册到管理器
        this.modals.set(config.id, {
            element: modal,
            config: config
        });

        // 绑定点击外部关闭事件
        modal.addEventListener('click', (e) => {
            if (e.target === modal && config.closeOnOverlayClick) {
                this.close(config.id);
            }
        });

        return config.id;
    }

    // 销毁遮罩
    destroy(modalId) {
        const modalData = this.modals.get(modalId);
        if (!modalData) return;

        // 如果正在显示，先关闭
        if (!modalData.element.classList.contains('hidden')) {
            this.close(modalId);
        }

        // 移除DOM元素
        setTimeout(() => {
            modalData.element.remove();
            this.modals.delete(modalId);
        }, this.animationDuration + 50);
    }

    // 获取遮罩状态
    getState(modalId) {
        const modalData = this.modals.get(modalId);
        if (!modalData) return null;

        return {
            isOpen: !modalData.element.classList.contains('hidden'),
            config: modalData.config
        };
    }

    // 获取所有注册的遮罩
    getAllModals() {
        return Array.from(this.modals.keys());
    }

    // 关闭所有遮罩
    closeAll() {
        const modalIds = Array.from(this.modals.keys());
        modalIds.forEach(id => {
            if (!this.modals.get(id).element.classList.contains('hidden')) {
                this.close(id);
            }
        });
    }
}

export default ModalManager;