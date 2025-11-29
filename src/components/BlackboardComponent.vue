<template>
  <div class="blackboard-container" :class="{ 'dark-theme': darkTheme }">
    <div class="toolbar">
      <el-button-group>
        <el-button 
          type="primary" 
          :plain="tool === 'text'" 
          @click="tool = 'text'"
        >
          文字
        </el-button>
        <el-button 
          type="primary" 
          :plain="tool === 'line'" 
          @click="tool = 'line'"
        >
          线条
        </el-button>
        <el-button 
          type="danger" 
          @click="clearCanvas"
        >
          清空
        </el-button>
      </el-button-group>
      <div class="color-picker">
        <span>颜色：</span>
        <input 
          type="color" 
          v-model="currentColor" 
          @input="updateColor"
        >
      </div>
      <div class="line-width">
        <span>线宽：</span>
        <el-slider 
          v-model="lineWidth" 
          :min="1" 
          :max="10" 
          :step="1"
        />
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
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { Blackboard, BlackboardItem } from '../types'

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
const clearCanvas = () => {
  if (!props.blackboard) return
  updateBlackboard([])
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
  transition: background-color 0.3s;
}

.blackboard-container.dark-theme {
  background-color: #1a1a1a;
}

.toolbar {
  padding: 10px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s;
}

.blackboard-container.dark-theme .toolbar {
  background-color: #2c2c2c;
  border-bottom: 1px solid #404040;
  color: #ffffff;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker input[type="color"] {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.line-width {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 150px;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: auto;
  background-color: #ffffff;
  transition: background-color 0.3s;
}

.blackboard-container.dark-theme .canvas-wrapper {
  background-color: #2c2c2c;
}

canvas {
  display: block;
  cursor: crosshair;
  border: 1px solid #e0e0e0;
  transition: border-color 0.3s;
}

.blackboard-container.dark-theme canvas {
  border-color: #404040;
}

.text-input-container {
  position: absolute;
  z-index: 10;
  min-width: 200px;
}

.text-input-container :deep(.el-input__wrapper) {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
}
</style>
