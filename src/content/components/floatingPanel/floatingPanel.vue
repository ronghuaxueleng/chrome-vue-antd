<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// 定义emits
const emit = defineEmits(['close'])

// 响应式数据
const isDragging = ref(false)
const isResizing = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const position = ref({ x: 100, y: 100 })
const size = ref({ width: 520, height: 450 })
const panelRef = ref(null)

// 从storage加载保存的位置和大小
onMounted(() => {
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['floatingPanelPosition', 'floatingPanelSize'], (result) => {
      if (result.floatingPanelPosition) {
        position.value = result.floatingPanelPosition
      }
      if (result.floatingPanelSize) {
        size.value = result.floatingPanelSize
      }
    })
  }
})

// 保存位置和大小到storage
const saveSettings = () => {
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({
      floatingPanelPosition: position.value,
      floatingPanelSize: size.value
    })
  }
}

// 拖拽开始
const startDrag = (e) => {
  if (isResizing.value) return
  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
  
  document.addEventListener('mousemove', drag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

// 拖拽中
const drag = (e) => {
  if (!isDragging.value) return
  
  const newX = e.clientX - dragOffset.value.x
  const newY = e.clientY - dragOffset.value.y
  
  // 确保面板不会被拖出视窗
  const maxX = window.innerWidth - size.value.width
  const maxY = window.innerHeight - size.value.height
  
  position.value.x = Math.max(0, Math.min(newX, maxX))
  position.value.y = Math.max(0, Math.min(newY, maxY))
}

// 拖拽结束
const stopDrag = () => {
  if (isDragging.value) {
    isDragging.value = false
    saveSettings()
  }
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('mouseup', stopDrag)
}

// 开始调整大小
const startResize = (e) => {
  isResizing.value = true
  const startX = e.clientX
  const startWidth = size.value.width
  
  const doResize = (e) => {
    if (!isResizing.value) return
    
    const newWidth = startWidth + (e.clientX - startX)
    const minWidth = 400
    const maxWidth = window.innerWidth - position.value.x - 20
    
    size.value.width = Math.max(minWidth, Math.min(newWidth, maxWidth))
  }
  
  const stopResize = () => {
    if (isResizing.value) {
      isResizing.value = false
      saveSettings()
    }
    document.removeEventListener('mousemove', doResize)
    document.removeEventListener('mouseup', stopResize)
  }
  
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
  e.preventDefault()
  e.stopPropagation()
}

// 关闭面板
const closePanel = () => {
  emit('close')
}

// 组件卸载时清理事件监听器
onUnmounted(() => {
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('mouseup', stopDrag)
})

// 计算样式
const panelStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  width: `${size.value.width}px`,
  height: `${size.value.height}px`,
  display: props.visible ? 'block' : 'none'
}))
</script>

<template>
  <div 
    ref="panelRef"
    class="floating-panel" 
    :style="panelStyle"
    v-show="visible"
  >
    <div 
      class="panel-header" 
      @mousedown="startDrag"
      :class="{ dragging: isDragging }"
    >
      <div class="panel-title">Cookie注入工具</div>
      <button class="close-btn" @click="closePanel" @mousedown.stop>×</button>
    </div>
    <div class="panel-content">
      <router-view />
    </div>
    <!-- 右边调整大小的手柄 -->
    <div 
      class="resize-handle" 
      @mousedown="startResize"
      :class="{ resizing: isResizing }"
    ></div>
  </div>
</template>

<style scoped>
.floating-panel {
  position: fixed;
  min-width: 400px;
  min-height: 300px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
  resize: none;
}

.panel-header {
  height: 40px;
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  cursor: move;
  user-select: none;
}

.panel-header.dragging {
  background: linear-gradient(to bottom, #e3f2fd, #bbdefb);
  cursor: grabbing;
}

.panel-title {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.panel-content {
  height: calc(100% - 40px);
  overflow: auto;
  background: white;
}

.close-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #6c757d;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #dc3545;
  color: white;
}

.close-btn:active {
  transform: scale(0.9);
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 100%;
  cursor: ew-resize;
  background: transparent;
  transition: background-color 0.2s ease;
}

.resize-handle:hover {
  background: rgba(0, 123, 255, 0.1);
}

.resize-handle.resizing {
  background: rgba(0, 123, 255, 0.2);
}

.resize-handle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3px;
  height: 20px;
  background: #dee2e6;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.resize-handle:hover::before,
.resize-handle.resizing::before {
  opacity: 1;
}
</style>