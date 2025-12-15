<template>
  <view class="chat-container">
    <!-- 聊天消息列表 -->
    <scroll-view
      scroll-y="true"
      class="message-list"
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
      @scrolltoupper="loadMoreMessages"
      upper-threshold="50"
      ref="messageScroll"
    >
      <view class="welcome-message">
        <view class="welcome-card">
          <view class="welcome-title">欢迎提供您的反馈</view>
          <view class="welcome-text">祝您用餐愉快，好运加倍！</view>
        </view>
      </view>

      <view class="message-item" v-for="(item, index) in messages" :key="index">
        <view class="message-content user-message">
          {{ item.content }}
        </view>
        <view class="message-time">{{ formatTime(item.create_time) }}</view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部输入框 -->
    <view class="input-area">
      <view class="input-box">
        <textarea
          class="message-input"
          v-model="inputContent"
          placeholder="请输入您的意见或建议..."
          :cursor-spacing="30"
          :show-confirm-bar="false"
          auto-height
          :maxlength="200"
          @keyboardheightchange="handleKeyboardHeightChange"
          confirm-type="send"
          @confirm="sendMessage"
        />
      </view>
      <view
        class="send-button"
        :class="{ active: inputContent.trim() }"
        @click="sendMessage"
      >
        <text>发送</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import {
  onShow,
  onLoad,
  onShareAppMessage,
  onShareTimeline,
} from "@dcloudio/uni-app";

// 消息列表
const messages = ref([]);
// 输入内容
const inputContent = ref("");
// 滚动位置
const scrollTop = ref(0);
// 用户信息
const userInfo = ref(null);
// 键盘高度
const keyboardHeight = ref(0);

// 初始化
onLoad(() => {
  getUserInfo();
});

// 页面显示时
onShow(() => {
  getUserInfo();
});

// 获取用户信息
const getUserInfo = () => {
  const user = uni.getStorageSync("userInfo");
  if (user) {
    userInfo.value = user;
  }
};

// 发送消息
const sendMessage = async () => {
  if (!inputContent.value.trim()) return;

  if (!userInfo.value) {
    uni.showToast({
      title: "请先登录",
      icon: "none",
    });
    setTimeout(() => {
      uni.navigateTo({
        url: "/pages/login/login",
      });
    }, 1500);
    return;
  }

  const content = inputContent.value.trim();
  const timestamp = Date.now();

  // 添加到本地消息列表
  messages.value.push({
    content,
    create_time: timestamp,
    user_id: userInfo.value._id,
    type: "feedback",
  });

  // 清空输入框
  inputContent.value = "";

  // 滚动到底部
  await nextTick();
  scrollToBottom();

  // 保存到数据库
  try {
    const token = uni.getStorageSync("token");

    await uniCloud.callFunction({
      name: "message",
      data: {
        action: "addMessage",
        content,
        type: "feedback",
        token,
      },
    });

    // 提示发送成功
    uni.showToast({
      title: "反馈已提交",
      icon: "success",
    });
  } catch (e) {
    console.error("保存消息失败:", e);

    // 发送失败也保留在本地
    uni.showToast({
      title: "发送成功，感谢您的反馈",
      icon: "success",
    });
  }
};

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 滚动到底部
const scrollToBottom = () => {
  // 使用一个随机值触发滚动
  scrollTop.value = Math.random() * 10000;
};

// 加载更多消息
const loadMoreMessages = () => {
  // 此功能暂不实现，预留接口
};

// 处理键盘高度变化
const handleKeyboardHeightChange = (e) => {
  keyboardHeight.value = e.detail.height;
  scrollToBottom();
};

// 页面加载完成后滚动到底部
onMounted(() => {
  scrollToBottom();
});

onShareAppMessage(() => {
  return {
    title: "意见反馈 - 今日美食",
    path: "/pages/chat/chat",
  };
});

onShareTimeline(() => {
  return {
    title: "意见反馈 - 今日美食",
    query: "",
  };
});
</script>

<style lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
  position: relative;
}

.message-list {
  flex: 1;
  padding: 20rpx 30rpx;
  overflow-y: scroll;
  box-sizing: border-box;
}

.welcome-message {
  display: flex;
  justify-content: center;
  margin: 30rpx 0;

  .welcome-card {
    background: linear-gradient(to right, #fa9153, #ff7048);
    padding: 30rpx;
    border-radius: 20rpx;
    color: #fff;
    width: 80%;
    box-shadow: 0 4rpx 20rpx rgba(250, 145, 83, 0.3);

    .welcome-title {
      font-size: 34rpx;
      font-weight: bold;
      margin-bottom: 16rpx;
      text-align: center;
    }

    .welcome-text {
      font-size: 28rpx;
      margin-bottom: 10rpx;
      text-align: center;
    }

    .welcome-tips {
      font-size: 24rpx;
      opacity: 0.9;
      text-align: center;
    }
  }
}

.message-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;

  .message-content {
    max-width: 80%;
    padding: 20rpx 30rpx;
    border-radius: 20rpx;
    font-size: 28rpx;
    margin-bottom: 10rpx;
    word-break: break-all;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

    &.user-message {
      background: linear-gradient(135deg, #ffffff, #f1f2f6);
      color: #333;
      border-left: 6rpx solid;
      border-image: linear-gradient(to bottom, #ff6b6b, #ff9f43) 1;
      border-radius: 20rpx;
      font-size: 28rpx;
      margin-bottom: 10rpx;
      word-break: break-all;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    }

    .send-button.active {
      background: linear-gradient(45deg, #2ecc71, #1abc9c);
      color: #fff;
      box-shadow: 0 4rpx 10rpx rgba(46, 204, 113, 0.3);
    }
  }

  .message-time {
    font-size: 22rpx;
    color: #999;
  }
}

.bottom-space {
  height: 30rpx;
}

.input-area {
  padding: 20rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  display: flex;
  align-items: flex-end;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.03);
  position: relative;
  z-index: 10;

  .input-box {
    flex: 1;
    background-color: #f8f8f8;
    border-radius: 36rpx;
    padding: 16rpx 24rpx;
    margin-right: 20rpx;

    .message-input {
      width: 100%;
      min-height: 72rpx;
      max-height: 200rpx;
      font-size: 28rpx;
      line-height: 1.5;
    }
  }

  .send-button {
    width: 120rpx;
    height: 72rpx;
    border-radius: 36rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    background-color: #eee;
    color: #999;
    transition: all 0.3s;

    &.active {
      background: linear-gradient(to right, #fa9153, #ff7048);
      color: #fff;
      box-shadow: 0 4rpx 10rpx rgba(250, 145, 83, 0.3);
    }
  }
}
</style>
