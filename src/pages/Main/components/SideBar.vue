<template>
  <div class="side-bar scroll-container">
    <div
      class="side-bar-item"
      v-for="app in aiAppList"
      :key="app.id"
      @click="onClickBarItem(app)"
      @mouseenter="showTooltip(app, $event)"
      @mouseleave="hideTooltip"
    >
      <img style="width: 20px; height: 20px" :src="app.logo" alt="" />
    </div>
    
    <!-- 自定义 Tooltip -->
    <div
      v-if="tooltip.show"
      class="tooltip"
      :style="{
        top: tooltip.top + 'px',
        left: tooltip.left + 'px',
      }"
    >
      {{ tooltip.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { AIAppList } from "./const";
import { useAppStore } from "../../../store/appStore";
import type { App } from "../../../store/appStore";

const aiAppList = ref(AIAppList);

const tooltip = reactive({
  show: false,
  text: "",
  top: 0,
  left: 0,
});

const showTooltip = (app: App, event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  
  tooltip.text = app.name;
  tooltip.top = rect.bottom + 8; // 在图标下方8px
  tooltip.left = rect.left + rect.width / 2 - 30; // 水平居中（大致）
  tooltip.show = true;
};

const hideTooltip = () => {
  tooltip.show = false;
};

const onClickBarItem = (app: App) => {
  const appStore = useAppStore();

  // 检查是否已有该应用的 tab 打开
  if (appStore.isTabOpen(app.id)) {
    // 如果已打开，找到对应的 tab 并激活
    const existingTab = appStore.getTabs.find(
      (tab: any) => tab.app.id === app.id
    );
    if (existingTab) {
      appStore.switchTab(existingTab.id);
    }
  } else {
    // 如果未打开，添加新的 tab
    appStore.addTab(app);
  }
};
</script>

<style scoped lang="scss">
.side-bar {
  width: fit-content;
  min-width: min-content;
  height: 60px;
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 4px;
  background-color: #ffffff;
  position: relative;
  align-items: center;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #d0d0d0;
    border-radius: 3px;

    &:hover {
      background-color: #b0b0b0;
    }
  }

  .side-bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 6px;
    padding: 8px;
    margin-right: 4px;
    background-color: #ffffff;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      background-color: #f0f4f8;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(74, 144, 226, 0.15);
    }

    &:active {
      transform: translateY(0);
    }

    img {
      border-radius: 4px;
      transition: transform 0.2s;
    }
  }
}

.tooltip {
  position: fixed;
  background-color: #2c3e50;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: tooltipFadeIn 0.2s ease-in-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.scroll-container {
  width: 300px;
  height: 200px;
  overflow: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scroll-container::-webkit-scrollbar {
  display: none;
}
</style>
