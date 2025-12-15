'use strict';

const db = uniCloud.database();
const orderCollection = db.collection('order');
const menuCollection = db.collection('menu');
const usersCollection = db.collection('users');

// 获取用户ID的工具函数
function getUserId(event) {
    // 尝试从多个可能的位置获取用户ID
    let uid = null;

    // 1. 从uniIdToken中获取
    if (event.uniIdToken && event.uniIdToken.uid) {
        uid = event.uniIdToken.uid;
    }
    // 2. 从event.uid中获取（直接传递的uid）
    else if (event.uid) {
        uid = event.uid;
    }
    // 3. 从event.token中获取（可能是自定义token结构）
    else if (event.token && event.token.uid) {
        uid = event.token.uid;
    }

    return uid;
}

// 生成订单编号
function generateOrderNo() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}${random}`;
}

// 创建订单
async function createOrder(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            message: '未登录或用户ID不存在',
        };
    }

    const { menu_id, dishes, total, remark = '' } = event;

    try {
        // 获取用户信息
        const userInfo = await usersCollection.doc(uid).get();
        if (!userInfo.data || userInfo.data.length === 0) {
            return {
                code: -1,
                message: '用户不存在'
            };
        }

        // 获取菜单信息
        const menu = await menuCollection.doc(menu_id).get();
        if (!menu.data || menu.data.length === 0) {
            return {
                code: -1,
                message: '菜单不存在'
            };
        }

        const menuData = menu.data[0];
        const user = userInfo.data[0];

        // 创建订单
        const orderData = {
            order_no: generateOrderNo(),
            menu_id,
            menu_name: menuData.name,
            creator_id: uid,
            creator_info: {
                nickname: user.nickname || '用户',
                avatar: user.avatar || ''
            },
            dishes, // 菜品列表
            total, // 总价
            remark, // 备注
            status: 'completed', // 订单状态 completed: 已完成
            create_time: Date.now(),
            update_time: Date.now()
        };

        const result = await orderCollection.add(orderData);

        return {
            code: 0,
            message: '创建订单成功',
            data: {
                order_id: result.id,
                order_no: orderData.order_no,
                create_time: orderData.create_time
            }
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            message: '创建订单失败: ' + e.message
        };
    }
}

// 获取订单列表
async function getUserOrders(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            message: '未登录或用户ID不存在',
        };
    }

    try {
        // 查询用户创建的订单
        const orders = await orderCollection.where({
            creator_id: uid
        })
            .orderBy('create_time', 'desc')
            .get();

        return {
            code: 0,
            message: '获取订单列表成功',
            data: orders.data
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            message: '获取订单列表失败: ' + e.message
        };
    }
}

// 获取订单详情
async function getOrderDetail(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            message: '未登录或用户ID不存在',
        };
    }

    const { orderId, id } = event;
    const orderIdToUse = orderId || id; // 支持两种参数名

    if (!orderIdToUse) {
        return {
            code: -1,
            message: '订单ID不存在',
        };
    }

    try {
        // 查询订单
        const order = await orderCollection.doc(orderIdToUse).get();

        if (!order.data || order.data.length === 0) {
            return {
                code: -1,
                message: '订单不存在'
            };
        }

        // 获取订单数据
        const orderData = order.data[0];

        return {
            code: 0,
            message: '获取订单详情成功',
            data: orderData
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            message: '获取订单详情失败: ' + e.message
        };
    }
}

// 获取菜单的所有订单
async function getMenuOrders(event, context) {
    const { uid } = event.uniIdToken;
    const { menu_id } = event;

    try {
        // 获取菜单信息
        const menu = await menuCollection.doc(menu_id).get();
        if (menu.data.length === 0) {
            return {
                code: -1,
                msg: '菜单不存在'
            };
        }

        const menuData = menu.data[0];

        // 检查用户是否有权限
        if (!menuData.participants.includes(uid)) {
            return {
                code: -1,
                msg: '无权访问该菜单order'
            };
        }

        // 查询菜单的所有订单
        const orders = await orderCollection.where({
            menu_id
        })
            .orderBy('create_date', 'asc')
            .get();

        return {
            code: 0,
            msg: '获取菜单订单列表成功',
            data: orders.data
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            msg: '获取菜单订单列表失败: ' + e.message
        };
    }
}

// 更新订单状态
async function updateOrderStatus(event, context) {
    const { uid } = event.uniIdToken;
    const { order_id, status } = event;

    try {
        // 查询订单
        const order = await orderCollection.doc(order_id).get();

        if (order.data.length === 0) {
            return {
                code: -1,
                msg: '订单不存在'
            };
        }

        // 检查用户是否有权限
        const orderData = order.data[0];
        if (orderData.creator_id !== uid) {
            return {
                code: -1,
                msg: '无权修改该订单'
            };
        }

        // 更新订单状态
        await orderCollection.doc(order_id).update({
            status: status,
            update_date: new Date()
        });

        // 如果订单状态为已完成，更新菜单状态
        if (status === 2) {
            await menuCollection.doc(orderData.menu_id).update({
                status: 2, // 已完成
                update_date: new Date()
            });
        }

        return {
            code: 0,
            msg: '更新订单状态成功'
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            msg: '更新订单状态失败: ' + e.message
        };
    }
}

// 添加菜品到已有订单（加菜）
async function addMoreDishes(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            message: '未登录或用户ID不存在',
        };
    }

    const { order_id, menu_id, dishes } = event;

    try {
        // 获取订单信息
        const order = await orderCollection.doc(order_id).get();
        if (!order.data || order.data.length === 0) {
            return {
                code: -1,
                message: '订单不存在'
            };
        }

        const orderData = order.data[0];

        // 检查订单是否是当前用户的
        if (orderData.creator_id !== uid) {
            return {
                code: -1,
                message: '无权修改该订单'
            };
        }

        // 检查订单创建时间是否超过两小时
        const twoHours = 2 * 60 * 60 * 1000; // 两小时的毫秒数
        if ((Date.now() - orderData.create_time) > twoHours) {
            return {
                code: -1,
                message: '订单已超过两小时，无法加菜'
            };
        }

        // 合并新旧菜品
        let updatedDishes = [...orderData.dishes];

        // 添加新菜品或增加已有菜品的数量
        for (const newDish of dishes) {
            const existingIndex = updatedDishes.findIndex(dish => dish.dish_id === newDish.dish_id);
            if (existingIndex > -1) {
                // 已有菜品，增加数量
                updatedDishes[existingIndex].count += newDish.count;
            } else {
                // 新菜品，直接添加
                updatedDishes.push(newDish);
            }
        }

        // 计算新的总价
        const newTotal = updatedDishes.reduce((total, dish) => total + dish.price * dish.count, 0);

        // 更新订单
        await orderCollection.doc(order_id).update({
            dishes: updatedDishes,
            total: newTotal,
            update_time: Date.now(),
            status: 'adding' // 标记为加菜中
        });

        return {
            code: 0,
            message: '加菜成功',
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            message: '加菜失败: ' + e.message
        };
    }
}

// 删除订单
async function deleteOrder(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            message: '未登录或用户ID不存在'
        };
    }

    const { order_id } = event;

    try {
        // 查询订单
        const order = await orderCollection.doc(order_id).get();

        if (!order.data || order.data.length === 0) {
            return {
                code: -1,
                message: '订单不存在'
            };
        }

        // 检查用户是否有权限（只有创建者可以删除订单）
        const orderData = order.data[0];
        if (orderData.creator_id !== uid) {
            return {
                code: -1,
                message: '只有订单创建者可以删除订单'
            };
        }

        // 删除订单
        await orderCollection.doc(order_id).remove();

        return {
            code: 0,
            message: '删除订单成功'
        };
    } catch (e) {
        console.error('删除订单出错:', e);
        return {
            code: -1,
            message: '删除订单失败: ' + e.message
        };
    }
}

// 云函数入口
exports.main = async (event, context) => {
    console.log('event', event);

    const { action } = event;

    // 根据action执行不同的操作
    switch (action) {
        case 'createOrder':
            return await createOrder(event, context);
        case 'getUserOrders':
            return await getUserOrders(event, context);
        case 'getOrderDetail':
            return await getOrderDetail(event, context);
        case 'getMenuOrders':
            return await getMenuOrders(event, context);
        case 'updateOrderStatus':
            return await updateOrderStatus(event, context);
        case 'addMoreDishes':
            return await addMoreDishes(event, context);
        case 'deleteOrder':
            return await deleteOrder(event, context);
        default:
            return {
                code: -1,
                message: '未知操作: ' + action
            };
    }
}; 