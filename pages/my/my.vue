<template>
  <view class="my-container">
    <!-- 用户信息 -->
    <view class="user-card">
      <view class="user-info" v-if="userInfo">
        <image src="../../static/logo.jpg" mode="aspectFill" style="border-radius: 50%;width: 70rpx;height: 70rpx;margin-right: 20rpx;"></image>
        <view class="user-detail">
          <text class="nickname">用户</text>
        </view>
      </view>
      <view class="login-btn" v-else @click="navToLogin">
        <text>请登录</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view class="menu-item" @click="navToAbout">
        <view class="menu-icon">
          <uni-icons type="info" size="24" color="#FA9153"></uni-icons>
        </view>
        <view class="menu-text">
          <text>关于我们</text>
        </view>
        <uni-icons type="right" size="18" color="#DDDDDD"></uni-icons>
      </view>
      <view class="menu-item" @click="navToFeedback">
        <view class="menu-icon">
          <uni-icons type="chatbubble" size="24" color="#1890FF"></uni-icons>
        </view>
        <view class="menu-text">
          <text>意见反馈</text>
        </view>
        <uni-icons type="right" size="18" color="#DDDDDD"></uni-icons>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-btn" v-if="userInfo" @click="logout">
      <text>退出登录</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onShow, onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";

// 用户信息
const userInfo = ref(null);

// 获取用户信息
const getUserInfo = () => {
  const user = uni.getStorageSync("userInfo");
  if (user) {
    userInfo.value = user;
  }
};

// 跳转到登录页
const navToLogin = () => {
  uni.navigateTo({
    url: "/pages/login/login",
  });
};

// 跳转到关于我们
const navToAbout = () => {
  uni.showModal({
    title: "关于我们",
    content: "v1.0.0",
    showCancel: false,
    confirmText: "知道了",
  });
};

// 跳转到意见反馈
const navToFeedback = () => {
  uni.navigateTo({
    url: "/pages/chat/chat",
  });
};

// 跳转到设置
const navToSettings = () => {
  uni.showToast({
    title: "功能开发中",
    icon: "none",
  });
};

// 退出登录
const logout = () => {
  uni.showModal({
    title: "提示",
    content: "确定要退出登录吗？",
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync("userInfo");
        uni.removeStorageSync("token");
        userInfo.value = null;
        uni.showToast({
          title: "已退出登录",
          icon: "success",
        });
      }
    },
  });
};

// 页面挂载
onMounted(() => {
  getUserInfo();
});

// 页面显示
onShow(() => {
  getUserInfo();
});

onShareAppMessage(() => {
  return {
    title: "我的 - 今日美食",
    path: "/pages/my/my",
  };
});

onShareTimeline(() => {
  return {
    title: "我的 - 今日美食",
    query: "",
  };
});
</script>

<style>
.my-container {
  padding: 30rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
  position: relative;
}

.my-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 280rpx;
  background: linear-gradient(135deg, #ff9966, #ff7043);
  z-index: 0;
  border-radius: 0 0 40rpx 40rpx;
}

.user-card {
  position: relative;
  z-index: 1;
  padding: 50rpx 40rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 130rpx;
  height: 130rpx;
  border-radius: 50%;
  margin-right: 30rpx;
  border: 6rpx solid #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(255, 122, 67, 0.25);
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 38rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
}

.login-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 25rpx 0;
}

.login-btn text {
  font-size: 34rpx;
  color: #301908;
  background: rgba(255, 255, 255, 0.25);
  padding: 20rpx 50rpx;
  border-radius: 50rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.menu-list {
  position: relative;
  z-index: 1;
  background-color: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 35rpx 40rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.04);
  position: relative;
  transition: all 0.3s;
}

.menu-item:active {
  background-color: rgba(0, 0, 0, 0.02);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  margin-right: 25rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-item:nth-child(1) .menu-icon {
  background-color: #adff83;
  box-shadow: 0 6rpx 12rpx rgba(250, 145, 83, 0.15);
}

.menu-item:nth-child(2) .menu-icon {
  background-color: #32beff;
  box-shadow: 0 6rpx 12rpx rgba(24, 144, 255, 0.15);
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.logout-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 35rpx 0;
  background-color: #ffffff;
  border-radius: 24rpx;
  margin-top: 60rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
}

.logout-btn text {
  font-size: 32rpx;
  color: #ff4d4f;
  font-weight: 500;
  position: relative;
  padding-left: 40rpx;
}

.logout-btn text::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 30rpx;
  height: 30rpx;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff4d4f'%3E%3Cpath d='M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4'/%3E%3Cpath d='M16 17l5-5-5-5'/%3E%3Cpath d='M21 12H9'/%3E%3C/svg%3E");
  background-size: 30rpx 30rpx;
  background-repeat: no-repeat;
}
</style> 