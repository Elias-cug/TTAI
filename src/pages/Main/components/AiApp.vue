<template>
  <div>
    <div></div>
    <div class="app-wrapper">
      <div class="app-item" v-for="app in apps" :key="app.id">
        <webview
          data-minapp-id="openai"
          allowpopups="true"
          partition="persist:webview"
          style="
            width: 100%;
            height: 100%;
            background-color: var(--color-background);
            display: inline-flex;
            overflow: auto;
          "
          :src="app.url"
        ></webview>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const apps = ref([
  {
    id: "openai",
    name: "ChatGPT",
    url: "https://chatgpt.com/",
    bodered: true,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    url: "https://yuanbao.tencent.com/",
  },
  {
    id: "moonshot",
    name: "Kimi",
    url: "https://kimi.moonshot.cn/",
  },
  {
    id: "zhipu",
    name: "zhipu",
    url: "https://chatglm.cn/main/alltoolsdetail",
    bodered: true,
  },
]);
</script>
<style lang="scss">
// grid 布局 2 行 2 列
.app-wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 16px;
  .app-item {
    border: 2px solid grey;
    border-radius: 8px;
    overflow: hidden;
  }
}
</style>
