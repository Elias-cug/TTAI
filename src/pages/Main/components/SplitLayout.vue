<template>
  <div class="split-layout">
    <template v-if="pane.type === 'single'">
      <AppView
        :tabId="pane.tabId || null"
        :paneId="pane.id"
        :canClose="canClosePane"
      />
    </template>
    <template v-else-if="pane.type === 'split' && pane.children">
      <PanelGroup
        :direction="pane.direction === 'horizontal' ? 'horizontal' : 'vertical'"
        class="panel-group"
      >
        <template v-for="(child, index) in pane.children" :key="child.id">
          <Panel :defaultSize="getDefaultSize()" :minSize="5" class="panel">
            <SplitLayout :pane="child" />
          </Panel>
          <PanelResizeHandle
            v-if="index < pane.children.length - 1"
            class="resize-handle"
          />
        </template>
      </PanelGroup>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { PanelGroup, Panel, PanelResizeHandle } from "vue-resizable-panels";
import type { SplitPane } from "../../../store/appStore";
import AppView from "./AppView.vue";

interface Props {
  pane: SplitPane;
}

const props = defineProps<Props>();

// 判断是否可以关闭面板
const canClosePane = computed(() => {
  // 如果是根面板且是单个面板，不能关闭
  if (props.pane.id === "root" && props.pane.type === "single") {
    return false;
  }
  // 其他情况都可以关闭
  return true;
});

// 计算每个面板的默认大小（百分比）
const getDefaultSize = (): number => {
  if (props.pane.type !== "split" || !props.pane.children) {
    return 100;
  }
  const count = props.pane.children.length;
  return 100 / count;
};
</script>

<style scoped lang="scss">
.split-layout {
  width: 100%;
  height: 100%;
  position: relative;
}

.panel-group {
  width: 100%;
  height: 100%;
}

.panel {
  position: relative;
  overflow: hidden;
}

.resize-handle {
  background-color: #e0e0e0;
  transition: background-color 0.2s;
  position: relative;
  z-index: 10;
  flex-shrink: 0;

  &[data-panel-group-direction="horizontal"] {
    width: 4px;
    min-width: 4px;
    cursor: col-resize;

    &:hover {
      background-color: #4a90e2;
    }
  }

  &[data-panel-group-direction="vertical"] {
    height: 4px;
    min-height: 4px;
    cursor: row-resize;

    &:hover {
      background-color: #4a90e2;
    }
  }

  &:active,
  &[data-resize-handle-state="dragging"] {
    background-color: #357abd;
  }
}
</style>
