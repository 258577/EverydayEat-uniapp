<!-- 图片弹窗组件 -->
<template>
  <view class="image-popup-container">
    <!-- 彩色圆角按钮 -->
    <view
      class="popup-button"
      :style="{ backgroundColor: buttonColor }"
      @click="showPopup"
    >
      {{ buttonText }}
    </view>

    <!-- 自定义弹窗 -->
    <view class="popup-mask" v-if="popupVisible" @click="hidePopup"></view>
    <view class="popup-content" v-if="popupVisible" @click.stop>
      <!-- 弹窗图片区域，可滚动 -->
      <scroll-view class="image-container" scroll-y="true">
        <image
          class="popup-image"
          :src="actualImageUrl"
          mode="widthFix"
          @error="handleImageError"
        ></image>
      </scroll-view>

      <!-- 关闭按钮 -->
      <view class="close-btn" @click="hidePopup">
        <text class="close-icon">×</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";

// 组件属性
const props = defineProps({
  // 按钮文字
  buttonText: {
    type: String,
    default: "点击查看",
  },
  // 按钮颜色
  buttonColor: {
    type: String,
    default: "#3498db",
  },
  // 图片链接 - 支持本地路径或云存储ID
  imageUrl: {
    type: String,
    required: true,
  },
  // 是否从云数据库加载
  fromCloud: {
    type: Boolean,
    default: false,
  },
  // 图片ID（用于从云数据库加载）
  imageId: {
    type: String,
    default: "",
  },
});

// 弹窗显示状态
const popupVisible = ref(false);

// 图片加载错误状态
const imageError = ref(false);

// 实际显示的图片URL
const actualImageUrl = ref(props.imageUrl);

// 显示弹窗
const showPopup = () => {
  popupVisible.value = true;
};

// 隐藏弹窗
const hidePopup = () => {
  popupVisible.value = false;
};

// 处理图片加载错误
const handleImageError = () => {
  imageError.value = true;
  console.error("图片加载失败:", actualImageUrl.value);
};

// 从云存储加载图片
const loadImageFromCloud = async () => {
  if (!props.fromCloud) return;

  try {
    // 如果提供了imageId，则从云数据库加载图片信息
    if (props.imageId) {
      const res = await uniCloud.callFunction({
        name: "images",
        data: {
          action: "getImageDetail",
          id: props.imageId,
        },
      });

      if (res.result && res.result.code === 0 && res.result.data) {
        actualImageUrl.value = res.result.data.url;
      } else {
        console.error("加载云存储图片失败:", res.result.message);
      }
    }
    // 如果imageUrl是云存储路径，则直接使用
    else if (props.imageUrl.startsWith("cloud://")) {
      actualImageUrl.value = props.imageUrl;
    }
  } catch (e) {
    console.error("加载云存储图片出错:", e);
  }
};

// 组件挂载时，如果需要从云存储加载图片，则进行加载
onMounted(() => {
  if (props.fromCloud) {
    loadImageFromCloud();
  }
});
</script>

<style lang="scss" scoped>
.image-popup-container {
  display: inline-block;
}

/* 按钮样式 */
.popup-button {
  padding: 20rpx 40rpx;
  border-radius: 50rpx;
  color: white;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  text-align: center;
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }
}

/* 弹窗遮罩 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

/* 弹窗内容 */
.popup-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 600rpx;
  max-height: 80vh;
  background-color: #fff;
  border-radius: 20rpx;
  z-index: 999;
  overflow: hidden;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.2);
}

/* 图片容器 */
.image-container {
  width: 100%;
  max-height: 80vh;
}

/* 弹窗图片 */
.popup-image {
  width: 100%;
  display: block;
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  z-index: 1000;
}

.close-icon {
  color: white;
  font-size: 40rpx;
  font-weight: bold;
  line-height: 1;
}
</style> 