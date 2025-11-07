<template>
  <div class="side-bar scroll-container">
    <div
      class="side-bar-item"
      v-for="app in aiAppList"
      :key="app.id"
      @click="onClickBarItem(app)"
    >
      <img style="width: 80px; height: 80px" :src="app.logo" alt="" />
      <span>{{ app.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { AIAppList } from "./const";
import { useAppStore } from "../../../store/appStore";
import type { App } from "../../../store/appStore";

const aiAppList = ref(AIAppList);

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
  width: 100px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 8px;
  background-color: #ffffff;

  &::-webkit-scrollbar {
    width: 6px;
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
    border: 1px solid #e8e8e8;
    border-radius: 10px;
    padding: 8px;
    margin-bottom: 8px;
    background-color: #ffffff;
    transition: all 0.2s;

    &:hover {
      background-color: #f0f4f8;
      border-color: #4a90e2;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(74, 144, 226, 0.15);
    }

    &:active {
      transform: translateY(0);
    }

    img {
      border-radius: 8px;
      margin-bottom: 6px;
      transition: transform 0.2s;
    }

    span {
      font-size: 11px;
      color: #666666;
      text-align: center;
      word-break: break-word;
      line-height: 1.2;
    }

    &:hover span {
      color: #4a90e2;
    }
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
