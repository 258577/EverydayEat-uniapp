<!-- 随机选择组件 -->
<template>
  <view class="random-selector">
    <view class="options-container">
      <view
        v-for="(option, index) in options"
        :key="index"
        class="option-item"
        :class="{ active: currentIndex === index }"
        :style="{
          backgroundColor: option.bgColor,
          borderColor: option.borderColor,
        }"
      >
        {{ option.text }}
      </view>
    </view>
    <view class="control-container">
      <button
        class="start-button"
        @click="startSelection"
        :disabled="isRunning"
      >
        {{ isRunning ? "选择中..." : "点击开始" }}
      </button>
    </view>

    <view v-if="selectedOption" class="result-container">
      <text class="result-text">结果: {{ selectedOption.text }}吧！</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";

// 定义选项数据
const options = [
  {
    text: "自己做",
    bgColor: "#E6F7FF",
    borderColor: "#1890FF",
  },
  {
    text: "点外卖",
    bgColor: "#F6FFED",
    borderColor: "#52C41A",
  },
  {
    text: "出去吃",
    bgColor: "#FFF7E6",
    borderColor: "#FA8C16",
  },
];

// 当前选中的索引
const currentIndex = ref(-1);
// 是否正在运行选择
const isRunning = ref(false);
// 最终选择的结果
const selectedOption = ref(null);

// 开始随机选择
const startSelection = () => {
  if (isRunning.value) return;

  isRunning.value = true;
  selectedOption.value = null;

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
    currentIndex.value = (currentIndex.value + 1) % options.length;

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
      selectedOption.value = options[currentIndex.value];
    }
  };

  // 开始选择
  select();
};
</script>

<style lang="scss" scoped>
.random-selector {
  padding: 5rpx;
}

.options-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
}

.option-item {
  width: 95%;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: 2rpx solid;
  transition: all 0.3s;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.option-item.active {
  transform: scale(1.05);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  border-width: 4rpx;
}

.control-container {
  margin: 30rpx 0;
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
  margin-top: 20rpx;
  text-align: center;
}

.result-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}
</style>