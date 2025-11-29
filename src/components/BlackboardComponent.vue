<template>
  <div class="blackboard-container" :class="{ 'dark-theme': darkTheme }">
    <div class="toolbar">
      <el-button-group>
        <el-button 
          type="primary" 
          :plain="tool === 'text'" 
          @click="tool = 'text'"
          size="large"
          :icon="Document"
        >
          <span>文字</span>
        </el-button>
        <el-button 
          type="primary" 
          :plain="tool === 'line'" 
          @click="tool = 'line'"
          size="large"
          :icon="Brush"
        >
          <span>线条</span>
        </el-button>
        <el-button 
          type="danger" 
          @click="handleClearCanvas"
          size="large"
          :icon="Delete"
        >
          <span>清空</span>
        </el-button>
      </el-button-group>
      
      <div class="toolbar-controls">
        <div class="control-group">
          <el-tooltip content="选择颜色" placement="bottom">
            <div class="color-picker">
              <el-icon :size="20" class="control-label">ColorPicker</el-icon>
              <input 
                type="color" 
                v-model="currentColor" 
                @input="updateColor"
                class="color-input"
              >
            </div>
          </el-tooltip>
        </div>
        
        <div class="control-group">
          <el-tooltip content="调整线宽" placement="bottom">
            <div class="line-width">
              <el-icon :size="20" class="control-label">ZoomIn</el-icon>
              <el-slider 
                v-model="lineWidth" 
                :min="1" 
                :max="15" 
                :step="1"
                :show-input="false"
                :show-tooltip="'always'"
                class="line-width-slider"
              />
              <span class="line-width-value">{{ lineWidth }}px</span>
            </div>
          </el-tooltip>
        </div>
        
        <div class="control-group tool-info">
          <el-tag :type="tool === 'text' ? 'primary' : 'success'" size="small">
            <el-icon :size="14">{{ tool === 'text' ? 'Document' : 'Brush' }}</el-icon>
            {{ tool === 'text' ? '文字工具' : '线条工具' }}
          </el-tag>
        </div>
      </div>
    </div>
    
    <div class="canvas-wrapper">
      <canvas
        ref="canvasRef"
        :width="canvasWidth"
        :height="canvasHeight"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @click="handleCanvasClick"
        :class="{ 'drawing-mode': tool === 'line' }"
      ></canvas>
      <div 
        v-if="tool === 'text' && showTextInput" 
        class="text-input-container"
        :style="{
          left: textInputPos.x + 'px',
          top: textInputPos.y + 'px'
        }"
      >
        <el-input
          ref="textInputRef"
          v-model="textInputValue"
          @blur="handleTextBlur"
          @keyup.enter="handleTextEnter"
          placeholder="输入文字..."
          size="small"
          clearable
          :prefix-icon="Document"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { Blackboard, BlackboardItem } from '../types'
import { Document, Brush, Delete, ColorPicker, ZoomIn } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const props = defineProps<{
  blackboard: Blackboard | undefined
}>()

const emit = defineEmits<{
  'update:blackboard': [blackboard: Blackboard]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const textInputRef = ref()
const canvasWidth = ref(800)
const canvasHeight = ref(600)
const tool = ref<'text' | 'line'>('line')
const currentColor = ref('#000000')
const lineWidth = ref(2)
const isDrawing = ref(false)
const startX = ref(0)
const startY = ref(0)
const darkTheme = ref(false)

// 文字输入相关
const showTextInput = ref(false)
const textInputPos = ref({ x: 0, y: 0 })
const textInputValue = ref('')

let ctx: CanvasRenderingContext2D | null = null

// 监听主题变化
const updateTheme = () => {
  darkTheme.value = document.documentElement.classList.contains('dark-theme')
}

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    resizeCanvas()
    drawCanvas()
    window.addEventListener('resize', resizeCanvas)
  }
  
  // 初始化主题
  updateTheme()
  window.addEventListener('themechange', updateTheme)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('themechange', updateTheme)
})

// 监听黑板变化，重新绘制
watch(() => props.blackboard, () => {
  drawCanvas()
}, { deep: true })

// 调整画布大小
const resizeCanvas = () => {
  if (!canvasRef.value) return
  
  const container = canvasRef.value.parentElement
  if (container) {
    canvasWidth.value = container.clientWidth
    canvasHeight.value = container.clientHeight
  }
  
  drawCanvas()
}

// 绘制画布
const drawCanvas = () => {
  if (!ctx || !props.blackboard) return
  
  // 清空画布
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // 设置背景色
  ctx.fillStyle = darkTheme.value ? '#2c2c2c' : '#ffffff'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // 绘制所有元素
  props.blackboard.items.forEach(item => {
    if (item.type === 'line') {
      drawLine(item)
    } else if (item.type === 'text') {
      drawText(item)
    }
  })
}

// 绘制线条
const drawLine = (item: BlackboardItem) => {
  if (!ctx) return
  
  ctx.beginPath()
  ctx.moveTo(item.position.x, item.position.y)
  ctx.lineTo(item.content.endX, item.content.endY)
  ctx.strokeStyle = item.content.color
  ctx.lineWidth = item.content.lineWidth
  ctx.stroke()
}

// 绘制文字
const drawText = (item: BlackboardItem) => {
  if (!ctx) return
  
  ctx.font = `${item.content.fontSize}px Arial`
  ctx.fillStyle = item.content.color
  ctx.fillText(item.content.text, item.position.x, item.position.y)
}

// 鼠标事件处理
const handleMouseDown = (e: MouseEvent) => {
  if (tool.value !== 'line' || !ctx) return
  
  isDrawing.value = true
  const rect = canvasRef.value?.getBoundingClientRect()
  if (rect) {
    startX.value = e.clientX - rect.left
    startY.value = e.clientY - rect.top
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDrawing.value || tool.value !== 'line' || !ctx) return
  
  const rect = canvasRef.value?.getBoundingClientRect()
  if (rect) {
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top
    
    // 重新绘制整个画布，然后绘制当前线条
    drawCanvas()
    
    ctx.beginPath()
    ctx.moveTo(startX.value, startY.value)
    ctx.lineTo(currentX, currentY)
    ctx.strokeStyle = currentColor.value
    ctx.lineWidth = lineWidth.value
    ctx.stroke()
  }
}

const handleMouseUp = (e: MouseEvent) => {
  if (!isDrawing.value || tool.value !== 'line' || !ctx || !props.blackboard) return
  
  isDrawing.value = false
  const rect = canvasRef.value?.getBoundingClientRect()
  if (rect) {
    const endX = e.clientX - rect.left
    const endY = e.clientY - rect.top
    
    // 创建新的线条元素
    const newLine: BlackboardItem = {
      id: `line-${Date.now()}`,
      type: 'line',
      position: { x: startX.value, y: startY.value },
      content: {
        endX,
        endY,
        color: currentColor.value,
        lineWidth: lineWidth.value
      }
    }
    
    // 更新黑板
    updateBlackboard([...props.blackboard.items, newLine])
  }
}

// 处理画布点击（文字工具）
const handleCanvasClick = (e: MouseEvent) => {
  if (tool.value !== 'text' || !props.blackboard) return
  
  const rect = canvasRef.value?.getBoundingClientRect()
  if (rect) {
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    showTextInput.value = true
    textInputPos.value = { x, y }
    textInputValue.value = ''
    
    nextTick(() => {
      textInputRef.value?.focus()
    })
  }
}

// 处理文字输入失焦
const handleTextBlur = () => {
  if (textInputValue.value.trim() && props.blackboard) {
    addTextItem()
  }
  showTextInput.value = false
}

// 处理文字输入回车
const handleTextEnter = () => {
  if (textInputValue.value.trim() && props.blackboard) {
    addTextItem()
  }
  showTextInput.value = false
}

// 添加文字元素
const addTextItem = () => {
  if (!props.blackboard) return
  
  const newText: BlackboardItem = {
    id: `text-${Date.now()}`,
    type: 'text',
    position: { ...textInputPos.value },
    content: {
      text: textInputValue.value,
      color: currentColor.value,
      fontSize: 16
    }
  }
  
  updateBlackboard([...props.blackboard.items, newText])
}

// 更新黑板
const updateBlackboard = (items: BlackboardItem[]) => {
  if (!props.blackboard) return
  
  const updatedBlackboard: Blackboard = {
    ...props.blackboard,
    items
  }
  
  emit('update:blackboard', updatedBlackboard)
}

// 清空画布
const handleClearCanvas = async () => {
  if (!props.blackboard) return
  
  try {
    await ElMessageBox.confirm('确定要清空画布吗？此操作不可恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    updateBlackboard([])
  } catch {
    // 取消清空操作
  }
}

// 更新颜色
const updateColor = () => {
  // 颜色变化时的处理
}


</script>

<style scoped>
.blackboard-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  transition: background-color 0.3s ease;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.blackboard-container.dark-theme {
  background-color: #1a1a1a;
}

.toolbar {
  padding: 15px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.blackboard-container.dark-theme .toolbar {
  background-color: #2c2c2c;
  border-bottom: 1px solid #404040;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.toolbar :deep(.el-button-group) {
  display: flex;
  gap: 8px;
}

.toolbar :deep(.el-button) {
  transition: all 0.3s ease;
  font-weight: 500;
}

.toolbar :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-label {
  color: #909399;
  transition: color 0.3s ease;
}

.blackboard-container.dark-theme .control-label {
  color: #c0c4cc;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-input {
  width: 40px;
  height: 40px;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: none;
  outline: none;
  padding: 2px;
}

.color-input:hover {
  border-color: #409eff;
  transform: scale(1.1);
}

.blackboard-container.dark-theme .color-input {
  border-color: #505050;
}

.blackboard-container.dark-theme .color-input:hover {
  border-color: #69b1ff;
}

.line-width {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 200px;
}

.line-width-slider {
  flex: 1;
}

.line-width-value {
  min-width: 40px;
  text-align: center;
  font-weight: 500;
  color: #409eff;
  font-size: 14px;
}

.blackboard-container.dark-theme .line-width-value {
  color: #69b1ff;
}

.tool-info {
  margin-left: auto;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: auto;
  background-color: #fafafa;
  transition: background-color 0.3s ease;
  background-image: 
    linear-gradient(#e0e0e0 1px, transparent 1px),
    linear-gradient(90deg, #e0e0e0 1px, transparent 1px);
  background-size: 20px 20px;
}

.blackboard-container.dark-theme .canvas-wrapper {
  background-color: #1f1f1f;
  background-image: 
    linear-gradient(#333333 1px, transparent 1px),
    linear-gradient(90deg, #333333 1px, transparent 1px);
  background-size: 20px 20px;
}

canvas {
  display: block;
  cursor: crosshair;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 20px;
  border-radius: 8px;
}

canvas.drawing-mode {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23409eff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='2'/%3E%3C/svg%3E") 12 12, crosshair;
}

.blackboard-container.dark-theme canvas {
  border-color: #404040;
  background-color: #2c2c2c;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.text-input-container {
  position: absolute;
  z-index: 100;
  min-width: 250px;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
}

.blackboard-container.dark-theme .text-input-container {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.text-input-container :deep(.el-input__wrapper) {
  box-shadow: none;
  border-radius: 8px;
  border: 2px solid #409eff;
  transition: all 0.3s ease;
}

.text-input-container :deep(.el-input__wrapper:focus-within) {
  border-color: #66b1ff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.blackboard-container.dark-theme .text-input-container :deep(.el-input__wrapper) {
  border-color: #69b1ff;
  background-color: #3a3a3a;
}

.blackboard-container.dark-theme .text-input-container :deep(.el-input__wrapper:focus-within) {
  border-color: #8cc5ff;
  box-shadow: 0 0 0 2px rgba(105, 177, 255, 0.2);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
