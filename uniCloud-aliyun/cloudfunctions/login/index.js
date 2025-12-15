'use strict';

// 引入数据库
const db = uniCloud.database();
const usersCollection = db.collection('users');

exports.main = async (event, context) => {
    // 获取客户端参数
    const { code, userInfo } = event;

    // 验证参数
    if (!code) {
        return {
            code: -1,
            msg: '缺少登录code'
        };
    }

    try {
        // 微信登录部分
        // 配置微信小程序信息
        const appId = 'wxca14d0be0f250fe8'; // 【重要】请填写您的小程序AppID
        const appSecret = '1a5592d7a9f38e8290ed92fcf1da1958'; // 【重要】请填写您的小程序AppSecret

        if (!appId || !appSecret) {
            return {
                code: -1,
                msg: '请在云函数中配置小程序AppID和AppSecret'
            };
        }

        // 通过code获取微信openid和session_key
        const wxLoginUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
        const wxRes = await uniCloud.httpclient.request(wxLoginUrl, {
            dataType: 'json'
        });

        // 验证微信返回结果
        if (wxRes.status !== 200 || !wxRes.data || wxRes.data.errcode) {
            console.error('获取微信登录凭证失败', wxRes.data);
            return {
                code: -1,
                msg: '微信登录失败: ' + (wxRes.data ? JSON.stringify(wxRes.data) : '请求错误')
            };
        }

        const { openid, session_key } = wxRes.data;
        if (!openid) {
            return {
                code: -1,
                msg: '获取openid失败'
            };
        }

        // 记录用户信息
        console.log('收到的用户信息:', userInfo);

        // 处理用户信息
        let nickname = '微信用户';
        let avatar = '/static/logo.jpg';

        // 如果前端传入了用户信息，则使用真实信息
        if (userInfo) {
            nickname = userInfo.nickName || userInfo.nickname || '微信用户';
            avatar = userInfo.avatarUrl || userInfo.avatar || '/static/logo.jpg';
        }

        // 查询用户是否已存在
        const userRecord = await usersCollection.where({
            openid: openid
        }).get();

        let userId = null;

        if (userRecord.data.length === 0) {
            // 用户不存在，创建新用户
            const newUser = {
                openid: openid,
                nickname: nickname,
                avatar: avatar,
                create_date: new Date(),
                last_login_date: new Date()
            };

            const insertRes = await usersCollection.add(newUser);
            userId = insertRes.id;
        } else {
            // 用户已存在，更新用户信息
            userId = userRecord.data[0]._id;

            // 如果有新的用户信息，则更新
            if (userInfo) {
                await usersCollection.doc(userId).update({
                    nickname: nickname,
                    avatar: avatar,
                    last_login_date: new Date()
                });
            } else {
                // 仅更新登录时间
                await usersCollection.doc(userId).update({
                    last_login_date: new Date()
                });
            }
        }

        // 获取完整的用户信息
        const userInfoRes = await usersCollection.doc(userId).get();

        // 如果没有获取到用户信息，则返回错误
        if (!userInfoRes.data || userInfoRes.data.length === 0) {
            return {
                code: -1,
                msg: '获取用户信息失败'
            };
        }

        // 生成简单的token（实际应用中应使用更安全的方式）
        const token = {
            uid: userId,
            openid: openid
        };

        // 返回成功结果
        return {
            code: 0,
            msg: '登录成功',
            data: {
                token: token,
                userInfo: userInfoRes.data[0]
            }
        };
    } catch (e) {
        console.error('登录处理出错', e);
        return {
            code: -1,
            msg: '登录失败: ' + e.message
        };
    }
};
