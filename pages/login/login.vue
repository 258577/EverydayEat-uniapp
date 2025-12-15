<template>
  <view class="login-container">
    <view class="logo-section">
      <image class="logo" src="/static/logo.jpg" mode="aspectFit"></image>
      <text class="app-name">今日美食</text>
      <text class="slogan">与朋友一起创建美味菜单</text>
    </view>

    <view class="login-btn-section">
      <button
        class="wechat-login-btn"
        :disabled="!agreementChecked"
        :class="{ 'btn-disabled': !agreementChecked }"
        @click="showAuthPopup = true"
      >
        <uni-icons type="weixin" size="20" color="#fff"></uni-icons>
        <text>微信一键登录</text>
      </button>
    </view>

    <view class="agreement">
      <checkbox-group @change="onAgreementChange">
        <checkbox
          value="agree"
          :checked="agreementChecked"
          style="transform: scale(0.8); margin-right: 8rpx"
        />
      </checkbox-group>
      <text class="agreement-text">我已阅读并同意</text>
      <text class="agreement-link" @click="openUserAgreement"
        >《用户协议》</text
      >
      <text class="agreement-text">和</text>
      <text class="agreement-link" @click="openPrivacyPolicy"
        >《隐私政策》</text
      >
    </view>

    <!-- 自定义授权弹窗 -->
    <view
      v-if="showAuthPopup"
      class="auth-popup-mask"
      @click.self="showAuthPopup = false"
    >
      <view class="auth-popup">
        <view class="auth-title">微信授权提示</view>
        <view class="auth-content">
          <view class="auth-desc">
            <text
              >我们需要获取您的微信昵称和头像用于个人信息展示信，仅用于本应用。</text
            >
            <text style="color: #fa9153; display: block; margin-top: 10rpx"
              >我们不会收集您的隐私信息。</text
            >
          </view>
        </view>
        <view class="auth-actions">
          <button class="auth-cancel" @click="showAuthPopup = false">
            取消
          </button>
          <button class="auth-confirm" @click="onConfirmAuth">同意授权</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";

// 用户信息
const userProfile = ref(null);
// 用户协议勾选
const agreementChecked = ref(false);
const showAuthPopup = ref(false);

// 用户点击弹窗"同意授权"按钮
const onConfirmAuth = () => {
  if (!agreementChecked.value) {
    uni.showToast({ title: "请先阅读并同意相关协议", icon: "none" });
    return;
  }
  uni.getUserProfile({
    desc: "用于完善会员资料",
    lang: "zh_CN",
    success: (res) => {
      // 统一存储为avatar和nickname
      userProfile.value = {
        avatar: res.userInfo.avatarUrl,
        nickname: res.userInfo.nickName,
      };
      showAuthPopup.value = false;
      handleWxLogin();
    },
    fail: (err) => {
      uni.showToast({
        title: "需要您授权才能登录",
        icon: "none",
      });
      // 授权失败不关闭弹窗
    },
  });
};

// 打开用户协议
const openUserAgreement = () => {
  uni.navigateTo({ url: "/pages/login/user-agreement" });
};
// 打开隐私政策
const openPrivacyPolicy = () => {
  uni.navigateTo({ url: "/pages/login/privacy-policy" });
};

// 获取用户信息并登录
const getUserProfile = () => {
  if (!agreementChecked.value) {
    uni.showToast({ title: "请先阅读并同意相关协议", icon: "none" });
    return;
  }
  // 调用微信的getUserProfile接口
  uni.getUserProfile({
    desc: "用于完善会员资料", // 声明获取用户个人信息后的用途
    lang: "zh_CN",
    success: (res) => {
      console.log("获取用户信息成功:", res);
      userProfile.value = res.userInfo;
      showAuthPopup.value = false; // 只有授权成功才关闭弹窗
      // 获取到用户信息后进行登录
      handleWxLogin();
    },
    fail: (err) => {
      console.error("获取用户信息失败:", err);
      uni.showToast({
        title: "需要您授权才能登录",
        icon: "none",
      });
      // 授权失败不关闭弹窗
    },
  });
};

// 微信登录处理方法
const handleWxLogin = async () => {
  // 显示加载中
  uni.showLoading({
    title: "登录中...",
    mask: true,
  });

  try {
    // 获取登录code
    const loginRes = await uni.login({
      provider: "weixin",
    });

    if (loginRes.errMsg !== "login:ok") {
      throw new Error("微信登录失败");
    }

    console.log("获取到登录code:", loginRes.code);

    // 调用云函数登录
    const result = await uniCloud.callFunction({
      name: "login",
      data: {
        code: loginRes.code,
        userInfo: userProfile.value, // 只传avatar和nickname
      },
    });

    handleLoginSuccess(result);
  } catch (e) {
    handleLoginError(e);
  } finally {
    uni.hideLoading();
  }
};

// 处理登录成功
const handleLoginSuccess = (result) => {
  console.log("云函数返回结果:", result);

  if (result.result.code === 0) {
    // 保存用户信息和token到本地，统一字段
    const info = result.result.data.userInfo;
    uni.setStorageSync("userInfo", {
      avatar: info.avatar || info.avatarUrl,
      nickname: info.nickname || info.nickName,
      _id: info._id,
    });
    uni.setStorageSync("token", result.result.data.token);
    uni.setStorageSync("uid", info._id);

    // 显示登录成功提示
    uni.showToast({
      title: "登录成功",
      icon: "success",
    });

    // 延迟返回上一页
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } else {
    throw new Error(result.result.msg);
  }
};

// 处理登录错误
const handleLoginError = (e) => {
  console.error("登录异常:", e);
  console.error("错误详情:", e.stack);
  uni.showToast({
    title: "登录失败: " + (e.message || "请重试"),
    icon: "none",
    duration: 3000,
  });
};

// 页面加载时检查登录状态
onLoad(() => {
  // 检查是否已登录
  const token = uni.getStorageSync("token");
  const userInfo = uni.getStorageSync("userInfo");

  if (token && userInfo) {
    console.log("用户已登录，信息:", userInfo);
    // 已登录则返回上一页
    setTimeout(() => {
      uni.navigateBack();
    }, 500);
  }
});

const onAgreementChange = (e) => {
  agreementChecked.value = e.detail.value.includes("agree");
};
</script>

<style>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 50rpx;
  height: 100vh;
  box-sizing: border-box;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 150rpx;
}

.logo {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.slogan {
  font-size: 28rpx;
  color: #999;
}

.login-btn-section {
  width: 100%;
  margin-bottom: 30rpx;
}

.wechat-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  background-color: #07c160;
  color: #fff;
  border-radius: 40rpx;
  font-size: 32rpx;
}

.wechat-login-btn uni-icons {
  margin-right: 10rpx;
}

.agreement {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 24rpx;
  color: #999;
  margin-top: 20rpx;
}

.agreement-text {
  color: #999;
}

.agreement-link {
  color: #fa9153;
  margin: 0 4rpx;
}

.btn-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.auth-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.auth-popup {
  background: #fff;
  border-radius: 18rpx;
  width: 600rpx;
  padding: 40rpx 30rpx 30rpx 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.auth-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}
.auth-content {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}
.auth-avatar {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  margin-right: 24rpx;
  background: #f5f5f5;
}
.auth-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.7;
  max-width: 380rpx;
}
.auth-actions {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-top: 10rpx;
}
.auth-cancel {
  flex: 1;
  background: #f5f5f5;
  color: #999;
  border-radius: 40rpx;
  margin-right: 20rpx;
  font-size: 28rpx;
}
.auth-confirm {
  flex: 1;
  background: linear-gradient(90deg, #07c160, #35c2a5);
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
}
</style>
