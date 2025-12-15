<template>
  <view class="container">
    <view class="header">
      <text class="title">今天吃什么？</text>
      <text class="subtitle">交给命运吧！</text>
    </view>

    <view class="content">
      <view class="tools-row">
        <!-- 随机选择基础版 -->
        <view class="tool-card">
          <view class="tool-title">基础选择</view>
          <RandomSelector />
        </view>

        <!-- 自定义随机选择 -->
        <view class="tool-card">
          <view class="tool-title">自定义选择</view>
          <CustomSelector />
        </view>
      </view>
    </view>
    <view class="content">
      <view class="tools-row">
        <view class="tool-card">
          <view class="tool-title">yes or no</view>
          <YesNoSelector />
        </view>

        <view class="tool-card">
          <view class="tool-title">四项选择</view>
          <ABCDSelector />
        </view>
      </view>
    </view>
    <!-- 图片弹窗工具区 -->
    <view class="image-buttons-row">
      <!-- 加载中提示 -->
      <view v-if="loading" class="loading-tips">
        <text>加载图片资源中...</text>
      </view>

      <!-- 云存储图片列表 -->
      <template v-else>
        <template v-if="images.length > 0">
          <ImagePopup
            v-for="item in images"
            :key="item._id"
            :buttonText="item.title"
            :buttonColor="item.buttonColor"
            :imageUrl="item.url"
            :fromCloud="true"
          />
        </template>
      </template>
    </view>

    <!-- 管理入口 -->
    <view class="admin-entry" @click="goToImageManager">
      <text class="admin-text">图片管理</text>
    </view>

    <view class="footer">
      <text class="tip">提示：随机结果仅供参考，最终决定权在您手中</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onShow, onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
import RandomSelector from "@/components/RandomSelector.vue";
import CustomSelector from "@/components/CustomSelector.vue";
import ImagePopup from "@/components/ImagePopup.vue";
import YesNoSelector from "@/components/YesNoSelector.vue";
import ABCDSelector from "@/components/ABCDSelector.vue";

// 图片数据
const images = ref([]);
const loading = ref(false);

// 加载云存储中的图片
const loadImages = async () => {
  loading.value = true;
  try {
    const res = await uniCloud.callFunction({
      name: "images",
      data: {
        action: "getAllImages",
      },
    });

    if (res.result && res.result.code === 0) {
      images.value = res.result.data || [];
    } else {
      console.error(
        "加载图片失败:",
        res.result ? res.result.message : "未知错误"
      );
    }
  } catch (e) {
    console.error("加载图片出错:", e);
  } finally {
    loading.value = false;
  }
};

// 跳转到图片管理页面
const goToImageManager = () => {
  uni.navigateTo({
    url: "/pages/admin/image-manager",
  });
};

onMounted(() => {
  loadImages();
});

onShow(() => {
  console.log("工具页面显示");
  // 每次页面显示时刷新图片列表
  loadImages();
});

onShareAppMessage(() => {
  return {
    title: "工具 - 今日美食",
    path: "/pages/tool/tool",
  };
});

onShareTimeline(() => {
  return {
    title: "工具 - 今日美食",
    query: "",
  };
});
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 40rpx 30rpx;
  background: linear-gradient(to right, #0088ff, #77c2ff);
  color: white;
  border-radius: 0 0 30rpx 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 28rpx;
  opacity: 0.9;
}

.content {
  flex: 1;
  padding: 15rpx;
  box-sizing: border-box;
  width: 100%;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin: 30rpx 15rpx 20rpx;
}

.tools-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 15rpx;
}

.tool-card {
  width: calc(50% - 15rpx);
  background-color: #fff;
  border-radius: 16rpx;
  padding: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 20rpx;
  box-sizing: border-box;
  min-width: 300rpx;
}

.tool-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 10rpx;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

/* 图片弹窗按钮区域 */
.image-buttons-row {
  display: flex;
  // display: none;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 10rpx 15rpx 30rpx;
}

.loading-tips {
  width: 100%;
  padding: 40rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

/* 管理入口 */
.admin-entry {
  margin: 0 auto 20rpx;
  padding: 15rpx 40rpx;
  background-color: #9c9c9c;
  border-radius: 50rpx;
  text-align: center;
  width: fit-content;
  display: block;
}

.admin-text {
  font-size: 24rpx;
  color: #282828;
}

.footer {
  padding: 30rpx;
  text-align: center;
  color: #999;
  font-size: 24rpx;
  border-top: 1rpx solid #eee;
}

.tip {
  line-height: 1.5;
}

/* 适配小屏幕 */
@media screen and (max-width: 768rpx) {
  .tool-card {
    width: 48%;
    padding: 12rpx;
    margin-bottom: 16rpx;
  }

  .tools-row {
    justify-content: center;
    gap: 10rpx;
  }

  .title {
    font-size: 36rpx;
  }

  .subtitle {
    font-size: 24rpx;
  }

  .content {
    padding: 15rpx 10rpx;
  }
}

/* 超窄屏幕 */
@media screen and (max-width: 400rpx) {
  .tool-card {
    width: 100%;
  }
}
</style>
