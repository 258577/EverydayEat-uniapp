<template>
  <view class="order-container">
    <!-- 订单列表 -->
    <view class="order-list">
      <view class="empty" v-if="orderList.length === 0">
        <image
          src="/static/images/empty.png"
          mode="aspectFit"
          class="action-icon"
        ></image>
        <text>暂无订单记录</text>
      </view>
      <view
        class="order-item"
        v-for="(item, index) in orderList"
        :key="index"
        @click="navToOrderDetail(item._id)"
        @longpress="handleOrderLongPress(item)"
      >
        <view
          class="order-main"
          :class="{
            'has-footer':
              (item.participants_info && item.participants_info.length) ||
              item.status !== 'completed',
          }"
        >
          <view class="order-info">
            <view class="title-row">
              <view class="order-title">{{ item.menu_name }}</view>
            </view>
            <view class="info-row">
              <view class="order-price">
                ¥{{
                  item.total !== undefined && item.total !== null
                    ? Number(item.total).toFixed(2)
                    : "0.00"
                }}
              </view>
              <view class="order-status" :class="getStatusClass(item.status)">
                {{ getStatusText(item.status) }}
              </view>
            </view>
            <view class="order-time">{{ formatDate(item.create_time) }}</view>
          </view>

          <scroll-view
            scroll-x="true"
            class="order-dishes"
            show-scrollbar="false"
          >
            <view class="dish-list">
              <view
                class="dish-item"
                v-for="(dish, i) in getDishes(item).slice(0, 3)"
                :key="i"
              >
                <view class="dish-wrapper">
                  <image
                    class="dish-image"
                    :src="dish.image"
                    mode="aspectFill"
                  ></image>
                  <text class="dish-name">{{ dish.name }}</text>
                </view>
              </view>
              <view class="more-dishes" v-if="getDishes(item).length > 3">
                <text>+{{ getDishes(item).length - 3 }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view
          class="order-footer"
          v-if="
            (item.participants_info && item.participants_info.length) ||
            item.status !== 'completed'
          "
        >
          <view
            class="participants"
            v-if="item.participants_info && item.participants_info.length"
          >
            <text>参与人：</text>
            <view class="participant-avatars">
              <image
                class="participant-avatar"
                v-for="(participant, i) in item.participants_info.slice(0, 3)"
                :key="i"
                :src="participant.avatar"
                mode="aspectFill"
              ></image>
              <view class="more" v-if="item.participants_info.length > 3"
                >+{{ item.participants_info.length - 3 }}</view
              >
            </view>
          </view>
          <view class="order-actions">
            <view
              class="action-btn complete-btn"
              v-if="item.status !== 'completed'"
              @click.stop="updateOrderStatus(item._id, 'completed')"
            >
              <text>完成订单</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部区域 -->
    <view class="loading" v-if="loading">
      <uni-load-more status="loading"></uni-load-more>
    </view>
    <view class="no-more" v-else-if="orderList.length > 0">
      <uni-load-more status="noMore"></uni-load-more>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { onLoad, onShow, onPullDownRefresh } from "@dcloudio/uni-app";

// 订单列表
const orderList = ref([]);
// 加载状态
const loading = ref(false);
// 用户信息
const userInfo = ref(null);

// 获取用户信息
const getUserInfo = () => {
  const user = uni.getStorageSync("userInfo");
  if (user) {
    userInfo.value = user;
    getOrderList();
  } else {
    uni.navigateTo({
      url: "/pages/login/login",
    });
  }
};

// 获取订单列表
const getOrderList = async () => {
  if (!userInfo.value) return;

  loading.value = true;
  try {
    const token = uni.getStorageSync("token");
    const uid = uni.getStorageSync("uid");

    const res = await uniCloud.callFunction({
      name: "order",
      data: {
        action: "getUserOrders",
        token: token,
        uid: uid,
      },
    });

    if (res.result.code === 0) {
      orderList.value = res.result.data;
      console.log("订单列表:", orderList.value);
    } else {
      uni.showToast({
        title: res.result.message || "获取订单失败",
        icon: "none",
      });
    }
  } catch (e) {
    console.error(e);
    uni.showToast({
      title: "获取订单列表失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
    uni.stopPullDownRefresh();
  }
};

// 更新订单状态
const updateOrderStatus = async (orderId, status) => {
  uni.showLoading({
    title: "处理中...",
    mask: true,
  });

  try {
    const token = uni.getStorageSync("token");
    const uid = uni.getStorageSync("uid");

    const res = await uniCloud.callFunction({
      name: "order",
      data: {
        action: "updateOrderStatus",
        order_id: orderId,
        status: status,
        token: token,
        uid: uid,
      },
    });

    if (res.result.code === 0) {
      uni.showToast({
        title: "操作成功",
        icon: "success",
      });
      getOrderList();
    } else {
      throw new Error(res.result.message || "操作失败");
    }
  } catch (e) {
    console.error(e);
    uni.showToast({
      title: "操作失败: " + e.message,
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 获取菜品列表，处理兼容性问题
const getDishes = (order) => {
  if (order.dishes && Array.isArray(order.dishes)) {
    return order.dishes;
  } else if (order.items && Array.isArray(order.items)) {
    return order.items;
  } else {
    return [];
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0:
    case "pending":
      return "待完成";
    case 1:
    case "adding":
      return "加菜中";
    case 2:
    case "completed":
      return "已完成";
    default:
      return "未知";
  }
};

// 获取状态类名
const getStatusClass = (status) => {
  switch (status) {
    case 0:
    case "pending":
      return "status-submitted";
    case 1:
    case "adding":
      return "status-additional";
    case 2:
    case "completed":
      return "status-completed";
    default:
      return "";
  }
};

// 跳转到订单详情
const navToOrderDetail = (orderId) => {
  console.log("跳转到订单详情页，订单ID:", orderId);
  uni.navigateTo({
    url: `/pages/order/detail?id=${orderId}`,
    success: () => {
      console.log("导航成功");
    },
    fail: (err) => {
      console.error("导航失败", err);
      uni.showToast({
        title: "打开订单详情失败",
        icon: "none",
      });
    },
  });
};

// 长按订单项
const handleOrderLongPress = (order) => {
  // 检查是否为创建者
  if (order.creator_id !== userInfo.value._id) {
    uni.showToast({
      title: "只有创建者可以删除订单",
      icon: "none",
    });
    return;
  }

  // 弹出确认框
  uni.showModal({
    title: "删除订单",
    content: `确定要删除该订单吗？`,
    success: async (res) => {
      if (res.confirm) {
        await deleteOrder(order._id);
      }
    },
  });
};

// 删除订单
const deleteOrder = async (orderId) => {
  uni.showLoading({
    title: "删除中...",
    mask: true,
  });

  try {
    const token = uni.getStorageSync("token");
    const uid = userInfo.value._id;

    const res = await uniCloud.callFunction({
      name: "order",
      data: {
        action: "deleteOrder",
        order_id: orderId,
        token: token,
        uid: uid,
      },
    });

    if (res.result && res.result.code === 0) {
      // 从本地列表中移除
      orderList.value = orderList.value.filter(
        (order) => order._id !== orderId
      );

      uni.showToast({
        title: "删除成功",
        icon: "success",
      });
    } else {
      throw new Error(res.result.message || "删除失败");
    }
  } catch (e) {
    console.error("删除订单失败:", e);
    uni.showToast({
      title: "删除订单失败: " + (e.message || "未知错误"),
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};

// 下拉刷新
onPullDownRefresh(() => {
  getOrderList();
});

// 页面挂载
onMounted(() => {
  getUserInfo();
});

// 页面显示
onShow(() => {
  getUserInfo();
});
</script>

<style>
.order-container {
  padding: 20rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty image {
  width: 40rpx;
  height: 10rpx;
  margin-bottom: 20rpx;
}

.empty text {
  color: #999;
  font-size: 28rpx;
}

.order-item {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  padding: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  position: relative;
  transition: all 0.3s;
  overflow: hidden;
  border-left: 4rpx solid transparent;
  background-image: linear-gradient(
    to right,
    rgba(250, 145, 83, 0.1),
    rgba(255, 255, 255, 0)
  );
}

.order-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4rpx;
  background: linear-gradient(to bottom, #fa9153, #ff7048);
  border-radius: 2rpx;
}

.order-item:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  background-image: linear-gradient(
    to right,
    rgba(250, 145, 83, 0.05),
    rgba(255, 255, 255, 0)
  );
}

.order-main {
  display: flex;
  align-items: flex-start;
  padding-bottom: 8rpx;
}

.order-main.has-footer {
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.04);
  margin-bottom: 8rpx;
}

.order-info {
  flex: 0 0 46%;
  padding-right: 10rpx;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6rpx;
}

.order-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  position: relative;
}

.order-time {
  font-size: 20rpx;
  color: #999;
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10rpx;
}

.order-price {
  font-size: 24rpx;
  color: #fa9153;
  font-weight: bold;
}

.order-dishes {
  flex: 1;
  width: 54%;
}

.dish-list {
  display: inline-flex;
  padding: 0;
}

.dish-item {
  margin-right: 10rpx;
}

.dish-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 85rpx;
}

.dish-image {
  width: 85rpx;
  height: 85rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid #fff;
  margin-bottom: 4rpx;
}

.dish-name {
  font-size: 18rpx;
  color: #666;
  width: 85rpx;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.more-dishes {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 85rpx;
  height: 85rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  color: #999;
  font-size: 22rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #fff;
}

.order-status {
  padding: 0 8rpx;
  height: 28rpx;
  line-height: 28rpx;
  font-size: 18rpx;
  border-radius: 14rpx;
  box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
}

.status-submitted {
  background: linear-gradient(to right, #fff7e6, #fff7e6);
  color: #fa9153;
  border: 1rpx solid rgba(250, 145, 83, 0.3);
}

.status-additional {
  background: linear-gradient(to right, #f9f0ff, #f9f0ff);
  color: #722ed1;
  border: 1rpx solid rgba(114, 46, 209, 0.3);
}

.status-completed {
  background: linear-gradient(to right, #f6ffed, #f6ffed);
  color: #52c41a;
  border: 1rpx solid rgba(82, 196, 26, 0.3);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8rpx;
}

.participants {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.participants text {
  font-size: 22rpx;
  color: #666;
  margin-right: 8rpx;
  white-space: nowrap;
}

.participant-avatars {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.participant-avatar {
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  margin-left: -8rpx;
  border: 2rpx solid #fff;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.participant-avatar:first-child {
  margin-left: 0;
}

.more {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  font-size: 16rpx;
  color: #999;
  margin-left: -8rpx;
  border: 2rpx solid #fff;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.order-actions {
  display: flex;
  margin-left: 10rpx;
}

.action-btn {
  padding: 6rpx 16rpx;
  font-size: 22rpx;
  color: #fa9153;
  background-color: rgba(250, 145, 83, 0.1);
  border-radius: 20rpx;
  margin-left: 10rpx;
}

.complete-btn {
  color: #52c41a;
  background-color: rgba(82, 196, 26, 0.1);
}

.loading,
.no-more {
  padding: 30rpx 0;
  color: #999;
  font-size: 24rpx;
  text-align: center;
}
</style> 