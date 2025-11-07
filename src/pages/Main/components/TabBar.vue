<template>
  <div class="tab-bar">
    <div class="tabs-container">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-item', { active: tab.id === activeTabId }]"
        @click="handleTabClick(tab.id)"
        @contextmenu.prevent="handleContextMenu($event, tab.id)"
      >
        <img :src="tab.app.logo" :alt="tab.title" class="tab-icon" />
        <span class="tab-title">{{ tab.title }}</span>
        <button
          class="tab-close"
          @click.stop="handleCloseTab(tab.id)"
          @mousedown.stop
        >
          ×
        </button>
      </div>
    </div>
    <div v-if="tabs.length === 0" class="empty-tabs">暂无打开的标签页</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppStore } from "../../../store/appStore";

const appStore = useAppStore();

const tabs = computed(() => appStore.getTabs);
const activeTabId = computed(() => appStore.getActiveTabId);

// 保存当前打开的菜单引用
let currentMenu: HTMLElement | null = null;
let currentMenuClickHandler: ((e: MouseEvent) => void) | null = null;

// 关闭当前菜单的函数
const closeCurrentMenu = () => {
  if (currentMenu && document.body.contains(currentMenu)) {
    document.body.removeChild(currentMenu);
  }
  if (currentMenuClickHandler) {
    document.removeEventListener("click", currentMenuClickHandler);
  }
  currentMenu = null;
  currentMenuClickHandler = null;
};

const handleTabClick = (tabId: string) => {
  appStore.switchTab(tabId);
};

const handleCloseTab = (tabId: string) => {
  appStore.removeTab(tabId);
};

const handleContextMenu = (event: MouseEvent, tabId: string) => {
  // 先关闭已存在的菜单
  closeCurrentMenu();

  const currentIndex = tabs.value.findIndex((t: any) => t.id === tabId);
  const hasRightTabs = currentIndex < tabs.value.length - 1;
  const hasOtherTabs = tabs.value.length > 1;

  const menu = document.createElement("div");
  menu.className = "context-menu";
  menu.innerHTML = `
    <div class="menu-item ${
      !hasOtherTabs ? "disabled" : ""
    }" data-action="close-others">
      <span class="menu-icon">⊠</span>
      <span class="menu-text">关闭其他</span>
    </div>
    <div class="menu-item ${
      !hasRightTabs ? "disabled" : ""
    }" data-action="close-right">
      <span class="menu-icon">⊳</span>
      <span class="menu-text">关闭右侧</span>
    </div>
  `;
  menu.style.position = "fixed";
  menu.style.left = `${event.clientX}px`;
  menu.style.top = `${event.clientY}px`;
  menu.style.zIndex = "10000";
  document.body.appendChild(menu);
  currentMenu = menu;

  const handleMenuClick = (e: MouseEvent) => {
    // 如果点击的是菜单内部
    if (menu.contains(e.target as Node)) {
      const target = (e.target as HTMLElement).closest(
        ".menu-item"
      ) as HTMLElement;
      // 如果点击的是菜单项，执行操作并关闭菜单
      if (target && !target.classList.contains("disabled")) {
        const action = target.getAttribute("data-action");
        if (action === "close-others") {
          appStore.removeOtherTabs(tabId);
        } else if (action === "close-right") {
          tabs.value.slice(currentIndex + 1).forEach((t: any) => {
            appStore.removeTab(t.id);
          });
        }
        closeCurrentMenu();
      }
      // 如果点击的是菜单内部但不是菜单项，不关闭（保持菜单打开）
      return;
    }
    // 点击外部时关闭菜单
    closeCurrentMenu();
  };

  currentMenuClickHandler = handleMenuClick;

  // 延迟添加事件监听，避免立即触发
  setTimeout(() => {
    document.addEventListener("click", handleMenuClick as EventListener);
  }, 0);
};
</script>

<style scoped lang="scss">
.tab-bar {
  height: 40px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #b0b0b0;
    border-radius: 2px;

    &:hover {
      background-color: #909090;
    }
  }

  .tabs-container {
    display: flex;
    height: 100%;
    min-width: 100%;
  }

  .tab-item {
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: 100%;
    background-color: #ffffff;
    border-right: 1px solid #e8e8e8;
    cursor: pointer;
    user-select: none;
    min-width: 120px;
    max-width: 240px;
    position: relative;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f0f4f8;
    }

    &.active {
      background-color: #ffffff;
      border-bottom: 2px solid #4a90e2;
    }

    .tab-icon {
      width: 16px;
      height: 16px;
      margin-right: 6px;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .tab-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
      color: #333333;
    }

    .tab-close {
      width: 18px;
      height: 18px;
      margin-left: 8px;
      border: none;
      background: transparent;
      color: #666666;
      cursor: pointer;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      line-height: 1;
      flex-shrink: 0;
      opacity: 0;
      transition: opacity 0.2s, background-color 0.2s;

      &:hover {
        background-color: #ff6b6b;
        color: #ffffff;
      }
    }

    &:hover .tab-close {
      opacity: 1;
    }
  }

  .empty-tabs {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    color: #999999;
    font-size: 13px;
  }
}
</style>

<style lang="scss">
/* 右键菜单样式 - 非 scoped，因为菜单是动态创建的 */
.context-menu {
  background-color: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  padding: 4px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04) inset;
  min-width: 120px;
  backdrop-filter: blur(10px);
  overflow: hidden;
  position: relative;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    color: #333333;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    .menu-icon {
      width: 14px;
      height: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
      font-size: 12px;
      color: #666666;
      transition: all 0.2s ease;
    }

    .menu-text {
      flex: 1;
      font-weight: 500;
    }

    &:hover:not(.disabled) {
      background-color: #f0f4f8;
      color: #4a90e2;
      transform: translateX(2px);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      .menu-icon {
        color: #4a90e2;
        transform: scale(1.15);
      }
    }

    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    }

    &[data-action="close-others"]:hover:not(.disabled) {
      background-color: #fff8e1;
      color: #ff9800;
      transform: translateX(2px);
      box-shadow: 0 1px 3px rgba(255, 152, 0, 0.2);

      .menu-icon {
        color: #ff9800;
        transform: scale(1.15);
      }
    }

    &[data-action="close-right"]:hover:not(.disabled) {
      background-color: #e3f2fd;
      color: #2196f3;
      transform: translateX(2px);
      box-shadow: 0 1px 3px rgba(33, 150, 243, 0.2);

      .menu-icon {
        color: #2196f3;
        transform: scale(1.15);
      }
    }
  }

  .menu-divider {
    height: 1px;
    background-color: #e8e8e8;
    margin: 3px 6px;
  }
}
</style>
