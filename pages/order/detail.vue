<template>
  <view class="order-detail-container">
    <!-- 订单状态展示 -->
    <view class="status-card">
      <view class="status-icon">
        <image src="../../static/images/commit.png" mode=""></image>
      </view>
      <view class="status-info">
        <text class="status-text">订单已提交</text>
        <text class="status-tip">感谢您的使用，请尽快自行处理您的订单</text>
      </view>
    </view>

    <!-- 菜单信息 -->
    <view class="card">
      <view class="card-title">
        <text>菜单信息</text>
      </view>
      <view class="menu-info">
        <text class="menu-name">{{ orderInfo.menu_name }}</text>
        <text class="order-time">{{ formatDate(orderInfo.create_time) }}</text>
      </view>
    </view>

    <!-- 订单详情 -->
    <view class="card">
      <view class="card-title">
        <text>订单详情</text>
      </view>
      <view class="dish-list">
        <view
          class="dish-item"
          v-for="(dish, index) in getDishes()"
          :key="index"
        >
          <image
            class="dish-image"
            :src="dish.image"
            mode="aspectFill"
            v-if="dish.image"
          ></image>
          <view class="dish-placeholder" v-else>
            <uni-icons type="image" size="20" color="#ddd"></uni-icons>
          </view>
          <view class="dish-info">
            <text class="dish-name">{{ dish.name }}</text>
            <view class="dish-detail">
              <text class="dish-price">¥{{ dish.price.toFixed(2) }}</text>
              <text class="dish-count">x{{ dish.count }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="order-total">
        <text>合计：</text>
        <text class="total-price"
          >¥{{ orderInfo.total ? orderInfo.total.toFixed(2) : "0.00" }}</text
        >
      </view>
    </view>

    <!-- 订单备注 -->
    <view class="card">
      <view class="card-title">
        <text>订单备注</text>
      </view>
      <view class="remark-input">
        <textarea
          v-model="remark"
          placeholder="请输入备注信息（选填）"
          maxlength="100"
          :disabled="orderInfo.order_id || isReadOnly"
        ></textarea>
      </view>
    </view>

    <!-- 底部操作区：新订单显示提交订单按钮 -->
    <view
      class="bottom-bar-container"
      v-if="!orderInfo.order_id && !isReadOnly"
    >
      <view class="bottom-bar floating">
        <view class="total-info">
          <text>合计：</text>
          <text class="total-price"
            >¥{{ orderInfo.total ? orderInfo.total.toFixed(2) : "0.00" }}</text
          >
        </view>
        <view class="submit-btn" @click="submitOrder">提交订单</view>
      </view>
    </view>

    <!-- 已完成订单显示导航按钮 -->
    <view class="fixed-bottom-container" v-else>
      <view class="fixed-bottom">
        <view class="action-buttons">
          <view class="back-to-home" @click="goToHome">返回首页</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";

export default {
  data() {
    return {
      orderId: "", // 订单ID
      orderInfo: {
        menu_id: "",
        menu_name: "",
        dishes: [],
        total: 0,
        create_time: Date.now(),
        order_id: "", // 如果有订单ID，说明是已经提交的订单
      },
      remark: "", // 订单备注
      loading: false, // 加载状态
      isReadOnly: false, // 是否是只读模式（从订单列表查看）
      mode: "", // 模式：add-加菜
    };
  },
  onLoad(options) {
    // 处理不同的加载情况
    if (options.orderInfo) {
      // 从菜单页跳转来，预览订单
      const orderInfo = JSON.parse(decodeURIComponent(options.orderInfo));
      this.orderInfo = {
        ...this.orderInfo,
        ...orderInfo,
        dishes: JSON.parse(orderInfo.cart),
      };
      // 如果order_id存在，设置orderId，便于分享
      if (orderInfo.order_id) {
        this.orderId = orderInfo.order_id;
      }
    } else if (options.id) {
      // 从订单列表查看详情
      this.orderId = options.id;
      this.isReadOnly = true;
      this.getOrderDetail();
    } else {
      uni.showToast({
        title: "参数错误",
        icon: "none",
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }

    // 如果是加菜模式
    if (options.mode === "add") {
      this.mode = "add";
    }
  },
  methods: {
    // 获取订单详情
    getOrderDetail() {
      if (!this.orderId) return;

      uni.showLoading({
        title: "加载中",
      });

      const token = uni.getStorageSync("token");
      const uid = uni.getStorageSync("uid");

      uniCloud
        .callFunction({
          name: "order",
          data: {
            action: "getOrderDetail",
            orderId: this.orderId,
            token,
            uid,
          },
        })
        .then((res) => {
          uni.hideLoading();
          const { code, message, data } = res.result;

          if (code === 0 && data) {
            this.orderInfo = data;
            this.remark = data.remark || "";
          } else {
            uni.showToast({
              title: message || "获取订单详情失败",
              icon: "none",
            });
          }
        })
        .catch((err) => {
          uni.hideLoading();
          uni.showToast({
            title: "获取订单详情失败",
            icon: "none",
          });
          console.error(err);
        });
    },

    // 获取显示的菜品列表
    getDishes() {
      if (this.orderInfo.dishes && Array.isArray(this.orderInfo.dishes)) {
        return this.orderInfo.dishes;
      } else if (this.orderInfo.items && Array.isArray(this.orderInfo.items)) {
        return this.orderInfo.items;
      } else {
        return [];
      }
    },

    // 提交订单
    submitOrder() {
      if (this.loading) return;

      this.loading = true;
      uni.showLoading({
        title: "提交中",
      });

      const token = uni.getStorageSync("token");
      const uid = uni.getStorageSync("uid");

      uniCloud
        .callFunction({
          name: "order",
          data: {
            action: "createOrder",
            menu_id: this.orderInfo.menu_id,
            dishes: this.orderInfo.dishes,
            total: this.orderInfo.total,
            remark: this.remark,
            token,
            uid,
          },
        })
        .then((res) => {
          uni.hideLoading();
          this.loading = false;
          const { code, message, data } = res.result;

          if (code === 0 && data) {
            uni.showToast({
              title: "订单提交成功",
              icon: "success",
            });

            // 更新菜单状态
            this.updateMenuStatus();

            // 更新当前页面数据，显示已完成状态
            this.orderInfo.order_id = data.order_id;
            this.orderInfo.create_time = data.create_time || Date.now();

            // 清空购物车
            this.clearCart();

            // 延时后返回订单列表页并刷新
            setTimeout(() => {
              // 直接跳转到订单页面
              uni.switchTab({
                url: "/pages/order/order",
              });
            }, 1500);
          } else {
            uni.showToast({
              title: message || "订单提交失败",
              icon: "none",
            });
          }
        })
        .catch((err) => {
          uni.hideLoading();
          this.loading = false;
          uni.showToast({
            title: "订单提交失败",
            icon: "none",
          });
          console.error(err);
        });
    },

    // 清空购物车
    clearCart() {
      try {
        // 获取当前菜单页面
        const pages = getCurrentPages();
        for (let i = 0; i < pages.length; i++) {
          if (pages[i].route === "pages/menu/menu") {
            // 调用菜单页面的清空购物车方法
            if (pages[i].$vm && typeof pages[i].$vm.clearCart === "function") {
              pages[i].$vm.clearCart();
            }
            break;
          }
        }
      } catch (e) {
        console.error("清空购物车失败", e);
      }
    },

    // 更新菜单状态
    updateMenuStatus() {
      // 获取token和uid
      let token = uni.getStorageSync("token");
      let uid = uni.getStorageSync("uid");

      // 检查token是否为对象类型
      if (typeof token === "object" && token !== null) {
        // 如果token是对象且包含uid属性，优先使用它
        if (token.uid && !uid) {
          uid = token.uid;
          console.log("从token对象中提取uid:", uid);
        }
        // 将token转换为字符串
        token = JSON.stringify(token);
      }

      // 确保uid不为空
      if (!uid && this.orderInfo && this.orderInfo.creator_id) {
        uid = this.orderInfo.creator_id;
        console.log("使用orderInfo中的creator_id作为uid:", uid);
      }

      console.log("准备更新菜单状态为已完成，菜单ID:", this.orderInfo.menu_id);
      console.log("菜单ID类型:", typeof this.orderInfo.menu_id);
      console.log("使用的uid:", uid, "类型:", typeof uid);

      // 检查菜单ID是否存在
      if (!this.orderInfo.menu_id) {
        console.error("没有找到菜单ID，无法更新菜单状态");
        return;
      }

      // 检查uid是否存在
      if (!uid) {
        console.error("没有找到用户ID，无法更新菜单状态");
        return;
      }

      // 确保menu_id是字符串类型
      let menuId = this.orderInfo.menu_id;

      // 如果是对象，尝试获取其id属性
      if (typeof menuId === "object" && menuId !== null) {
        console.log("菜单ID是对象类型，尝试获取其id属性");
        if (menuId._id) {
          menuId = menuId._id;
          console.log("从对象中获取到ID:", menuId);
        } else if (menuId.id) {
          menuId = menuId.id;
          console.log("从对象中获取到ID:", menuId);
        }
      }

      // 转换为字符串
      menuId = String(menuId);
      console.log("转换后的菜单ID:", menuId, "类型:", typeof menuId);

      // 确保ID不为空且为字符串或数字类型
      if (
        !menuId ||
        (typeof menuId !== "string" && typeof menuId !== "number")
      ) {
        console.error("菜单ID无效，无法更新菜单状态");
        return;
      }

      const requestData = {
        action: "updateMenuStatus",
        menu_id: menuId,
        status: "completed",
        token: uid, // 直接使用uid作为token
        uid: uid, // 确保uid不为空
      };

      console.log("发送请求数据:", JSON.stringify(requestData));

      // 尝试直接使用字符串ID而不是对象
      uniCloud
        .callFunction({
          name: "menu",
          data: {
            action: "updateMenuStatus",
            menuId: menuId, // 尝试使用menuId作为参数名
            menu_id: menuId, // 同时保留menu_id
            status: "completed",
            token: uid,
            uid: uid,
          },
        })
        .then((res) => {
          const { code, message } = res.result;
          console.log("更新菜单状态结果:", JSON.stringify(res.result));

          if (code === 0) {
            console.log("菜单状态已更新为已完成");

            // 在本地存储标记菜单状态已更新，以便首页刷新菜单列表
            try {
              uni.setStorageSync("menu_status_updated", {
                menu_id: menuId,
                status: "completed",
                timestamp: Date.now(),
              });
              console.log("已在本地存储标记菜单状态更新");
            } catch (e) {
              console.error("存储菜单状态更新标记失败:", e);
            }
          } else {
            console.error("更新菜单状态失败:", message);
            this.retryUpdateMenuStatus();
          }
        })
        .catch((err) => {
          console.error("更新菜单状态出错:", err);
          // 出错后重试一次
          this.retryUpdateMenuStatus();
        });
    },

    // 重试更新菜单状态
    retryUpdateMenuStatus() {
      console.log("重试更新菜单状态...");
      setTimeout(() => {
        // 获取token和uid
        let token = uni.getStorageSync("token");
        let uid = uni.getStorageSync("uid");

        // 检查token是否为对象类型
        if (typeof token === "object" && token !== null) {
          // 如果token是对象且包含uid属性，优先使用它
          if (token.uid && !uid) {
            uid = token.uid;
            console.log("重试：从token对象中提取uid:", uid);
          }
          // 将token转换为字符串
          token = JSON.stringify(token);
        }

        // 确保uid不为空
        if (!uid && this.orderInfo && this.orderInfo.creator_id) {
          uid = this.orderInfo.creator_id;
          console.log("重试：使用orderInfo中的creator_id作为uid:", uid);
        }

        console.log("重试：使用的uid:", uid, "类型:", typeof uid);

        // 检查uid是否存在
        if (!uid) {
          console.error("重试：没有找到用户ID，无法更新菜单状态");
          return;
        }

        // 确保menu_id是字符串类型
        let menuId = this.orderInfo.menu_id;

        // 如果是对象，尝试获取其id属性
        if (typeof menuId === "object" && menuId !== null) {
          console.log("重试：菜单ID是对象类型，尝试获取其id属性");
          if (menuId._id) {
            menuId = menuId._id;
            console.log("重试：从对象中获取到ID:", menuId);
          } else if (menuId.id) {
            menuId = menuId.id;
            console.log("重试：从对象中获取到ID:", menuId);
          }
        }

        // 转换为字符串
        menuId = String(menuId);
        console.log("重试：转换后的菜单ID:", menuId, "类型:", typeof menuId);

        // 确保ID不为空且为字符串或数字类型
        if (
          !menuId ||
          (typeof menuId !== "string" && typeof menuId !== "number")
        ) {
          console.error("重试：菜单ID无效，无法更新菜单状态");
          return;
        }

        // 尝试直接使用字符串ID而不是对象
        uniCloud
          .callFunction({
            name: "menu",
            data: {
              action: "updateMenuStatus",
              menuId: menuId, // 尝试使用menuId作为参数名
              menu_id: menuId, // 同时保留menu_id
              status: "completed",
              token: uid,
              uid: uid,
            },
          })
          .then((res) => {
            const { code, message } = res.result;
            console.log("重试：更新菜单状态结果:", JSON.stringify(res.result));

            if (code === 0) {
              console.log("重试成功：菜单状态已更新为已完成");

              // 在本地存储标记菜单状态已更新，以便首页刷新菜单列表
              try {
                uni.setStorageSync("menu_status_updated", {
                  menu_id: menuId,
                  status: "completed",
                  timestamp: Date.now(),
                });
                console.log("重试：已在本地存储标记菜单状态更新");
              } catch (e) {
                console.error("重试：存储菜单状态更新标记失败:", e);
              }
            } else {
              console.error("重试更新菜单状态仍然失败:", message);

              // 最后尝试使用替代方法更新菜单状态
              this.updateMenuStatusAlternative(menuId, uid);
            }
          })
          .catch((err) => {
            console.error("重试更新菜单状态出错:", err);

            // 出错后尝试替代方法
            this.updateMenuStatusAlternative(menuId, uid);
          });
      }, 1000);
    },

    // 替代方法更新菜单状态
    updateMenuStatusAlternative(menuId, uid) {
      console.log("尝试替代方法更新菜单状态...");

      // 直接在本地存储标记菜单状态已更新
      try {
        uni.setStorageSync("menu_status_updated", {
          menu_id: menuId,
          status: "completed",
          timestamp: Date.now(),
        });
        console.log("已在本地存储标记菜单状态更新");

        // 显示提示
        uni.showToast({
          title: "订单已完成",
          icon: "success",
          duration: 2000,
        });
      } catch (e) {
        console.error("存储菜单状态更新标记失败:", e);
      }
    },

    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");

      return `${year}-${month}-${day} ${hour}:${minute}`;
    },

    // 返回上一页
    goBack() {
      uni.navigateBack();
    },

    // 返回首页
    goToHome() {
      uni.switchTab({
        url: "/pages/index/index",
      });
    },
  },
  onShareAppMessage() {
    // 生成分享路径，带上订单id
    const orderId = this.orderId || (this.orderInfo && this.orderInfo.order_id);
    return {
      title:
        `美食订单详情` +
        (this.orderInfo.menu_name ? ` - ${this.orderInfo.menu_name}` : ""),
      path: `/pages/order/detail?id=${orderId}`,
      imageUrl:
        this.orderInfo.dishes &&
        this.orderInfo.dishes[0] &&
        this.orderInfo.dishes[0].image
          ? this.orderInfo.dishes[0].image
          : "",
    };
  },
  onShareTimeline() {
    // 朋友圈分享
    const orderId = this.orderId || (this.orderInfo && this.orderInfo.order_id);
    return {
      title:
        `美食订单详情` +
        (this.orderInfo.menu_name ? ` - ${this.orderInfo.menu_name}` : ""),
      query: `id=${orderId}`,
      imageUrl:
        this.orderInfo.dishes &&
        this.orderInfo.dishes[0] &&
        this.orderInfo.dishes[0].image
          ? this.orderInfo.dishes[0].image
          : "",
    };
  },
};
</script>

<style lang="scss" scoped>
.order-detail-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 180rpx;
  padding-top: 20rpx;
}

/* 删除自定义导航栏样式 */

.status-card {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  background-color: #fa9153;
  margin: 0 20rpx 20rpx;
  border-radius: 12rpx;

  .status-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    overflow: hidden;
  }

  .status-icon image {
    width: 60rpx;
    height: 60rpx;
    object-fit: contain;
    display: block;
  }

  .status-info {
    flex: 1;

    .status-text {
      font-size: 36rpx;
      color: #fff;
      font-weight: bold;
      margin-bottom: 10rpx;
      display: block;
    }

    .status-tip {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

.card {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .card-title {
    padding: 24rpx 30rpx;
    border-bottom: 1rpx solid #f5f5f5;

    text {
      font-size: 30rpx;
      font-weight: bold;
    }
  }

  .menu-info {
    padding: 30rpx;

    .menu-name {
      font-size: 30rpx;
      margin-bottom: 10rpx;
      display: block;
    }

    .order-time {
      font-size: 26rpx;
      color: #999;
    }
  }

  .dish-list {
    .dish-item {
      display: flex;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid rgba(0, 0, 0, 0.04);
      position: relative;
      transition: all 0.3s ease;

      &:last-child {
        border-bottom: none;
      }

      .dish-image {
        width: 120rpx;
        height: 120rpx;
        border-radius: 12rpx;
        margin-right: 24rpx;
        box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.06);
        border: 2rpx solid #fff;
        background-color: #fafafa;
        position: relative;
        overflow: hidden;
      }

      .dish-image::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          to bottom right,
          rgba(255, 255, 255, 0.1),
          rgba(0, 0, 0, 0.05)
        );
        pointer-events: none;
      }

      .dish-info {
        flex: 1;
        overflow: hidden;

        .dish-name {
          font-size: 28rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 8rpx;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dish-detail {
          display: flex;
          justify-content: space-between;

          .dish-price {
            font-size: 28rpx;
            background: linear-gradient(45deg, #2ecc71, #1abc9c);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            font-weight: bold;
          }

          .dish-count {
            font-size: 26rpx;
            color: #666;
          }
        }
      }
    }
  }

  .order-total {
    padding: 30rpx;
    text-align: right;
    font-size: 28rpx;

    .total-price {
      color: #fa9153;
      font-weight: bold;
      font-size: 32rpx;
    }
  }

  .remark-input {
    padding: 30rpx;
    background-color: #f9f9f9;
    border-radius: 12rpx;
    font-size: 28rpx;
    width: 100%;
    box-sizing: border-box;
    margin-top: 20rpx;
    border: 1rpx solid rgba(0, 0, 0, 0.04);
    transition: all 0.3s;

    textarea {
      width: 100%;
      height: 160rpx;
      background-color: #f8f8f8;
      border-radius: 8rpx;
      padding: 20rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }
  }

  .remark-input:focus {
    background-color: #fff;
    border-color: rgba(250, 145, 83, 0.3);
    box-shadow: 0 0 0 2rpx rgba(250, 145, 83, 0.1);
  }
}

.bottom-bar-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 30rpx;
  background-color: transparent;
  box-shadow: none;
  z-index: 99;
  padding-bottom: 40rpx;

  .bottom-bar {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 50rpx;
    height: 100rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    position: relative;
    bottom: 30rpx;

    .total-info {
      flex: 1;
      padding: 0 30rpx;
      font-size: 28rpx;

      .total-price {
        color: #fa9153;
        font-weight: bold;
        font-size: 32rpx;
      }
    }

    .submit-btn {
      width: 240rpx;
      height: 100%;
      background-color: #fa9153;
      color: #fff;
      font-size: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0 50rpx 50rpx 0;
    }
  }
}

.fixed-bottom-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 30rpx;
  background-color: transparent;
  box-shadow: none;
  z-index: 99;
  padding-bottom: 40rpx;

  .fixed-bottom {
    position: relative;
    bottom: 30rpx;
    background: transparent;
    box-shadow: none;

    .action-buttons {
      display: flex;
      justify-content: center;

      .back-to-home {
        width: 80%;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 40rpx;
        font-size: 32rpx;
        color: #fff;
        background-color: #fa9153;
        box-shadow: 0 4rpx 16rpx rgba(250, 145, 83, 0.3);
      }
    }
  }
}
</style>