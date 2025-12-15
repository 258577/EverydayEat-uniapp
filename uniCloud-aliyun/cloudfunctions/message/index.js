'use strict';

const db = uniCloud.database();
const messageCollection = db.collection('message');
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

// 添加消息
async function addMessage(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            message: '未登录或用户ID不存在',
        };
    }

    const { content, type = 'feedback' } = event;

    // 验证消息内容
    if (!content || content.trim() === '') {
        return {
            code: -1,
            message: '消息内容不能为空',
        };
    }

    try {
        // 获取用户信息
        const userInfo = await usersCollection.doc(uid).get();
        if (!userInfo.data || userInfo.data.length === 0) {
            return {
                code: -1,
                message: '用户不存在'
            };
        }

        // 创建消息数据
        const messageData = {
            content,
            user_id: uid,
            type,
            status: 0, // 未处理
            create_time: Date.now(),
            update_time: Date.now()
        };

        // 添加到数据库
        const result = await messageCollection.add(messageData);

        return {
            code: 0,
            message: '消息发送成功',
            data: {
                message_id: result.id,
                create_time: messageData.create_time
            }
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            message: '发送消息失败: ' + e.message
        };
    }
}

// 获取用户消息列表（预留功能）
async function getUserMessages(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            message: '未登录或用户ID不存在',
        };
    }

    try {
        // 查询用户的消息
        const messages = await messageCollection
            .where({ user_id: uid })
            .orderBy('create_time', 'desc')
            .get();

        return {
            code: 0,
            message: '获取消息列表成功',
            data: messages.data
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            message: '获取消息列表失败: ' + e.message
        };
    }
}

// 云函数入口
exports.main = async (event, context) => {
    console.log('event', event);

    const { action } = event;

    // 根据action执行不同的操作
    switch (action) {
        case 'addMessage':
            return await addMessage(event, context);
        case 'getUserMessages':
            return await getUserMessages(event, context);
        default:
            return {
                code: -1,
                message: '未知操作: ' + action
            };
    }
}; 