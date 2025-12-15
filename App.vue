<script>
export default {
  onLaunch: function () {
    console.log("App Launch");
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
};
</script>

<style>
/*每个页面公共css */

/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica,
    Segoe UI, Arial, Roboto, "PingFang SC", "miui", "Hiragino Sans GB",
    "Microsoft Yahei", sans-serif;
  background-color: #f5f7fa;
  color: #333;
  font-size: 28rpx;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 1px 边框处理 */
.border-bottom::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.05);
  transform: scaleY(0.5);
}

.border-top::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.05);
  transform: scaleY(0.5);
}

/* 页面容器 */
.container {
  padding: 24rpx;
}

/* 按钮 */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #fa9153, #ff7048);
  color: #fff;
  box-shadow: 0 8rpx 16rpx rgba(250, 145, 83, 0.2);
}

.btn-primary:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 8rpx rgba(250, 145, 83, 0.15);
}

.btn-default {
  background-color: #f5f5f5;
  color: #666;
}

.btn-default:active {
  background-color: #ebebeb;
}

/* 卡片 */
.card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

/* 文本颜色 */
.text-primary {
  color: #fa9153 !important;
}

.text-success {
  color: #52c41a !important;
}

.text-warning {
  color: #faad14 !important;
}

.text-danger {
  color: #f5222d !important;
}

.text-muted {
  color: #999 !important;
}

/* 字体大小 */
.font-sm {
  font-size: 24rpx;
}

.font-md {
  font-size: 28rpx;
}

.font-lg {
  font-size: 32rpx;
}

.font-xl {
  font-size: 36rpx;
}

.font-xxl {
  font-size: 40rpx;
}

/* 弹性布局 */
.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.flex-1 {
  flex: 1;
}

/* 边距 */
.mt-10 {
  margin-top: 10rpx;
}

.mb-10 {
  margin-bottom: 10rpx;
}

.ml-10 {
  margin-left: 10rpx;
}

.mr-10 {
  margin-right: 10rpx;
}

.mt-20 {
  margin-top: 20rpx;
}

.mb-20 {
  margin-bottom: 20rpx;
}

.ml-20 {
  margin-left: 20rpx;
}

.mr-20 {
  margin-right: 20rpx;
}

/* 圆角 */
.rounded-sm {
  border-radius: 8rpx;
}

.rounded {
  border-radius: 16rpx;
}

.rounded-lg {
  border-radius: 24rpx;
}

.rounded-full {
  border-radius: 9999rpx;
}
</style>
