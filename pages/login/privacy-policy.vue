<template>
  <view class="privacy-container">
    <!-- 顶部导航 -->
    <view class="privacy-header">
      <text class="privacy-title">[等会吃咩] 隐私政策</text>
      <text class="privacy-subtitle">保护您的个人信息安全</text>
    </view>

    <!-- 内容区域 -->
    <view class="privacy-content">
      <view class="privacy-intro">
        <text>
          欢迎使用
          [等会吃咩]！我们深知个人信息对您的重要性，因此高度重视保护您的隐私。本隐私政策旨在向您说明，在您使用本小程序提供的用户创建菜单、添加生成菜单及虚拟下单服务过程中，我们如何收集、使用、存储、共享、保护您的个人信息。请您在使用小程序前，仔细阅读并理解本隐私政策全部内容。如您不同意本隐私政策的任何内容，请您不要使用本小程序；您一旦使用本小程序，即表示您已充分阅读、理解并接受本隐私政策全部内容。
        </text>
      </view>

      <!-- 第一部分：我们收集的个人信息 -->
      <view class="privacy-section" id="section-1">
        <view class="section-header">
          <text class="section-number">一</text>
          <text class="section-title">我们收集的个人信息</text>
        </view>

        <view class="section-content">
          <view class="info-item">
            <text class="info-title">注册登录信息</text>
            <text class="info-content">
              为方便您使用小程序功能，在您登录小程序时，我们会获取您的微信
              ID、头像及昵称信息。这些信息用于小程序内身份识别、个性化服务展示及用户管理，是保障服务正常使用所必需的基础信息。
            </text>
          </view>

          <view class="info-item">
            <text class="info-title">使用过程信息</text>
            <text class="info-content">
              在您使用创建菜单、虚拟下单等功能时，我们可能会收集您的操作记录，包括菜单创建内容、虚拟下单的模拟商品信息、操作时间等。此外，为提升服务质量和用户体验，我们还会收集您的设备信息（如设备型号、操作系统版本）、网络信息（如
              IP
              地址、网络类型）等日志信息，这些信息仅用于服务分析和优化，不会与您的个人身份信息进行关联。
            </text>
          </view>
        </view>
      </view>

      <!-- 第二部分：个人信息的使用目的 -->
      <view class="privacy-section" id="section-2">
        <view class="section-header">
          <text class="section-number">二</text>
          <text class="section-title">个人信息的使用目的</text>
        </view>

        <view class="section-content">
          <view class="purpose-item">
            <text class="purpose-title">提供核心服务</text>
            <text class="purpose-content">
              利用收集的微信
              ID、头像及昵称信息，为您提供个性化的登录体验；根据您的操作记录，保障菜单创建、虚拟下单等功能的正常运行和数据展示。
            </text>
          </view>

          <view class="purpose-item">
            <text class="purpose-title">服务优化与改进</text>
            <text class="purpose-content">
              通过分析设备信息、网络信息及操作记录等日志信息，我们能够了解小程序的使用情况，发现潜在问题，从而优化功能、提升服务稳定性和用户体验。
            </text>
          </view>

          <view class="purpose-item">
            <text class="purpose-title">安全保障</text>
            <text class="purpose-content">
              收集相关信息有助于我们识别和防范安全风险，保护您的账号及使用安全，预防恶意攻击、非法访问等行为。
            </text>
          </view>
        </view>
      </view>

      <!-- 第三部分：个人信息的存储 -->
      <view class="privacy-section" id="section-3">
        <view class="section-header">
          <text class="section-number">三</text>
          <text class="section-title">个人信息的存储</text>
        </view>

        <view class="section-content">
          <view class="storage-item">
            <text class="storage-title">存储期限</text>
            <text class="storage-content">
              我们仅在为实现本隐私政策所述目的所必需的最短时间内保留您的个人信息。当您停止使用小程序后，我们将停止收集您的相关信息，并在合理期限内删除或匿名化处理您存储在小程序中的个人信息。若您违反本小程序相关协议或法律法规规定，导致账号被封禁，我们也将在协议终止后删除或匿名化处理您的账号及相关数据。
            </text>
          </view>

          <view class="storage-item">
            <text class="storage-title">存储地点</text>
            <text class="storage-content">
              您的个人信息将存储在中国境内服务器上，我们承诺不会将您的个人信息传输至境外，除非获得您的明确同意或法律法规另有规定。
            </text>
          </view>
        </view>
      </view>

      <!-- 后续部分省略，结构相同 -->

      <!-- 第九部分：联系我们 -->
      <view class="privacy-section" id="section-9">
        <view class="section-header">
          <text class="section-number">九</text>
          <text class="section-title">联系我们</text>
        </view>

        <view class="section-content">
          <text class="contact-intro">
            如果您对本隐私政策或我们处理您个人信息的行为有任何疑问、意见或建议，欢迎通过以下方式联系我们：
          </text>

          <view class="contact-item">
            <text class="contact-title">客服邮箱：</text>
            <text class="contact-content">[2585776284@qq.com]</text>
          </view>

          <view class="contact-item">
            <text class="contact-title">在线客服：</text>
            <text class="contact-content"
              >您可在小程序内的客服入口与我们联系</text
            >
          </view>

          <text class="contact-response">
            我们将在收到您的反馈后3个工作日内进行回复，并尽力解决您的问题。
          </text>
        </view>
      </view>

      <!-- 页脚 -->
      <view class="privacy-footer">
        <text class="footer-text">© 2025 [等会吃咩] 版权所有</text>
        <text class="update-date">更新日期：2025年6月4日</text>
      </view>
    </view>
  </view>
</template>

<script>
import { onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
export default {
  data() {
    return {
      // 页面数据
    };
  },
  onLoad() {
    // 页面加载时执行
  },
  onShareAppMessage() {
    return {
      title: "隐私政策 - 今日美食",
      path: "/pages/login/privacy-policy",
    };
  },
  onShareTimeline() {
    return {
      title: "隐私政策 - 今日美食",
      query: "",
    };
  },
  methods: {
    // 页面方法
  },
};
</script>

<style>
/* 基础样式 */
.privacy-container {
  padding: 30rpx 24rpx;
  background-color: #ffffff;
}

.privacy-header {
  margin-bottom: 40rpx;
  text-align: center;
  padding: 30rpx 0;
  background-color: #f8f8f8;
  border-radius: 12rpx;
}

.privacy-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 12rpx;
}

.privacy-subtitle {
  font-size: 26rpx;
  color: #666666;
}

.privacy-intro {
  padding: 24rpx;
  background-color: #fefefe;
  border: 1rpx solid #e6e6e6;
  border-radius: 12rpx;
  margin-bottom: 60rpx;
}

.privacy-intro text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.8;
}

/* 章节样式 */
.privacy-section {
  margin-bottom: 60rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #e6e6e6;
}

.section-number {
  width: 48rpx;
  height: 48rpx;
  background-color: #1677ff;
  color: #ffffff;
  border-radius: 50%;
  text-align: center;
  line-height: 48rpx;
  font-size: 28rpx;
  margin-right: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.section-content {
  padding: 30rpx;
}

/* 信息项样式 */
.info-item,
.purpose-item,
.storage-item,
.share-item,
.protection-item,
.right-item,
.minor-item,
.change-item,
.contact-item {
  margin-bottom: 40rpx;
}

.info-title,
.purpose-title,
.storage-title,
.share-title,
.protection-title,
.right-title,
.minor-title,
.change-title,
.contact-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 15rpx;
}

.info-content,
.purpose-content,
.storage-content,
.share-content,
.protection-content,
.right-content,
.minor-content,
.change-content,
.contact-content,
.contact-intro,
.contact-response {
  display: block;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.8;
}

/* 联系我们样式 */
.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.contact-title {
  min-width: 160rpx;
  font-weight: 500;
}

/* 页脚样式 */
.privacy-footer {
  text-align: center;
  padding: 30rpx 0;
  border-top: 1rpx solid #e6e6e6;
}

.footer-text {
  font-size: 26rpx;
  color: #999999;
  display: block;
  margin-bottom: 12rpx;
}

.update-date {
  font-size: 24rpx;
  color: #aaaaaa;
}
</style>