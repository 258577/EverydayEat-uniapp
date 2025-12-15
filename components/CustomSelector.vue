<!-- 自定义随机选择组件 -->
<template>
  <view class="custom-selector">
    <!-- 用户自定义输入区域 -->
    <view class="input-area">
      <input
        class="option-input"
        type="text"
        v-model="inputOption"
        placeholder="输入选项"
        @keydown.enter.prevent="addCustomOption"
      />
      <button
        class="add-btn"
        @click="addCustomOption"
        :disabled="!inputOption.trim()"
      >
        添加
      </button>
    </view>

    <!-- 快捷选项 -->
    <view class="quick-options">
      <view class="section-title">快捷常吃</view>
      <view class="quick-tags">
        <view
          v-for="(option, index) in quickOptions"
          :key="'quick-' + index"
          class="quick-tag"
          @click="toggleQuickOption(option)"
          :class="{ selected: selectedOptions.some((item) => item === option) }"
        >
          {{ option }}
        </view>
      </view>
    </view>

    <!-- 已选择的选项 -->
    <view v-if="selectedOptions.length > 0" class="selected-options">
      <view class="section-title">已选择的选项</view>
      <view class="options-list">
        <view
          v-for="(option, index) in selectedOptions"
          :key="index"
          class="selected-option"
        >
          {{ option }}
          <text class="delete-btn" @click="removeOption(index)">×</text>
        </view>
      </view>
    </view>

    <!-- 控制按钮 -->
    <view class="control-container">
      <button
        class="start-button"
        @click="startSelection"
        :disabled="isRunning || selectedOptions.length < 2"
      >
        {{ isRunning ? "选择中..." : "点击开始" }}
      </button>
    </view>

    <!-- 结果显示 -->
    <view v-if="selectedResult" class="result-container">
      <text class="result-text">结果：{{ selectedResult }}！</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";

// 快捷选项
const quickOptions = ["火锅", "烤肉", "家常菜"];

// 用户输入的选项
const inputOption = ref("");
// 已选择的选项列表
const selectedOptions = ref([]);
// 当前选中的索引
const currentIndex = ref(-1);
// 是否正在运行选择
const isRunning = ref(false);
// 最终选择的结果
const selectedResult = ref("");

// 添加自定义选项
const addCustomOption = () => {
  const option = inputOption.value.trim();
  if (option && !selectedOptions.value.includes(option)) {
    selectedOptions.value.push(option);
    inputOption.value = "";
  }
};

// 切换快捷选项
const toggleQuickOption = (option) => {
  const index = selectedOptions.value.indexOf(option);
  if (index === -1) {
    selectedOptions.value.push(option);
  } else {
    selectedOptions.value.splice(index, 1);
  }
};

// 移除选项
const removeOption = (index) => {
  selectedOptions.value.splice(index, 1);
};

// 开始随机选择
const startSelection = () => {
  if (isRunning.value || selectedOptions.value.length < 2) return;

  isRunning.value = true;
  selectedResult.value = "";

  // 初始速度（毫秒）
  let speed = 100;
  // 最慢速度
  const maxSpeed = 500;
  // 加速因子
  const accelerationFactor = 1.15;
  // 总共选择的次数
  const totalSelections = 15 + Math.floor(Math.random() * 10);
  // 当前选择次数
  let currentSelection = 0;

  // 选择函数
  const select = () => {
    // 更新当前索引
    currentIndex.value =
      (currentIndex.value + 1) % selectedOptions.value.length;

    currentSelection++;

    // 如果还没结束，继续选择
    if (currentSelection < totalSelections) {
      // 逐渐减慢速度
      if (currentSelection > totalSelections * 0.6) {
        speed = Math.min(speed * accelerationFactor, maxSpeed);
      }

      setTimeout(select, speed);
    } else {
      // 选择结束
      isRunning.value = false;
      selectedResult.value = selectedOptions.value[currentIndex.value];
    }
  };

  // 开始选择
  select();
};
</script>

<style lang="scss" scoped>
.custom-selector {
  padding: 5rpx;
}

.input-area {
  display: flex;
  margin-bottom: 14rpx;
}

.option-input {
  flex: 1;
  height: 60rpx;
  border: 1px solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  background-color: #fff;
}

.add-btn {
  width: 120rpx;
  height: 60rpx;
  margin-left: 10rpx;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  padding: 0;
}

.section-title {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.quick-options {
  margin-bottom: 14rpx;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.quick-tag {
  font-size: 20rpx;
  padding: 6rpx 12rpx;
  border-radius: 20rpx;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #eee;
}

.quick-tag.selected {
  background-color: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}

.selected-options {
  margin-bottom: 14rpx;
}

.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.selected-option {
  font-size: 22rpx;
  padding: 8rpx 15rpx;
  border-radius: 20rpx;
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
  display: flex;
  align-items: center;
}

.delete-btn {
  margin-left: 6rpx;
  font-size: 24rpx;
  color: #ff4d4f;
  font-weight: bold;
}

.control-container {
  margin: 16rpx 0;
  display: flex;
  justify-content: center;
}

.start-button {
  background: linear-gradient(to right, #1890ff, #52c41a);
  color: white;
  padding: 10rpx 40rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  font-weight: bold;
  border: none;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.15);
}

.start-button:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}

.result-container {
  margin-top: 16rpx;
  text-align: center;
}

.result-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}
</style> 