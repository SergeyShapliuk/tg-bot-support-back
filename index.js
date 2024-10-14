require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

// const express = require('express');
// const cors = require('cors');
// const sequelize = require('./db');
// const UserModel = require('./models');
// new comment

const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {polling: true});
// const app = express();

// app.use(express.json());
// app.use(cors());


const start_bot = async () => {

    // try {
    //     await sequelize.authenticate();
    //     await sequelize.sync();
    //
    // } catch (e) {
    //     console.log('Ошибка подключения к базе данных', e)
    // }
    if (process.env.NODE_ENV === 'development') {
        bot.setMyCommands([
            {command: 'start', description: 'Запуск бота'},
            {command: 'play', description: 'Тестирование'},
        ]).then(res => console.log('res', res))
    } else {
        bot.setMyCommands([
            {command: 'start', description: 'Запуск бота'},
        ]).then(res => console.log('res', res))
    }

    // console.log('env', process.env.NODE_ENV)
    // console.log('token', process.env.BOT_TOKEN)
    bot.on('message', async msg => {
            const text = msg.text
            const chat_id = msg.chat.id
            try {
                if (text.startsWith('/start')) {
                    const userName = msg.chat.username ?? msg.chat.first_name
                    const parts = text.split(" ");
                    let referralCode = null;
                    // await sequelize.truncate();
                    // await createUserIfNotExists(chat_id)
                    if (parts.length > 1) {
                        referralCode = parts[1].replace('ref_', '');  // Убираем префикс ref_
                    }
                    // console.log('referralCode', referralCode)
                    if (referralCode) {
                        await axios.post('https://sd-api.faexb.com/api/use-ref-code',
                            {
                                telegram_id: chat_id,
                                telegram_name: userName,
                                code: referralCode
                            },
                            {
                                headers: {
                                    "Content-Type": "multipart/form-data"
                                }
                            });
                    } else {
                        await axios.post('https://sd-api.faexb.com/api/set-user-info',
                            {
                                telegram_id: chat_id,
                                telegram_name: userName,
                            },
                            {
                                headers: {
                                    "Content-Type": "multipart/form-data"
                                }
                            });
                        // console.log('res2', response2.data)
                    }
                    //     await bot.sendMessage(chat_id, `Ваш реферальный код: ${referralCode}`);
                    // } else {
                    //     await bot.sendMessage(chat_id, 'Реферальный код не найден.');
                    // }
                    const stickerPath = './public/assets/sticker_Durov.webp';
                    await bot.sendSticker(chat_id, fs.createReadStream(stickerPath), {}, {
                        filename: 'sticker_Durov',
                        contentType: 'image/webp'
                    })
                    await bot.sendMessage(chat_id, `Welcome ${msg.from.first_name}!`, {
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: 'Game',
                                    web_app: {url: 'https://tg-bot-support.onrender.com'}
                                }],
                                [{text: 'Join community', url: 'https://t.me/sup_durov'}]
                            ], resize_keyboard: true
                        }
                    })
                }
                // if (text === '/info') {
                // const user = await UserModel.findOne({where: {chatId: chat_id}});
                // console.log('pg', user)
                // if (user.dataValues.chatId) {
                //     await bot.sendMessage(chat_id, `Ваш id чата ${user.dataValues.chatId} ${user.dataValues.points} поинтов`);
                // } else {
                //     await bot.sendMessage(chat_id, 'Пользователь не найден');
                // }
                // }
                if (text === '/play') {
                    await bot.sendMessage(chat_id, `https://sergeyshapliuk.github.io/portfolio/`, {
                        reply_markup: {
                            inline_keyboard: [
                                [{text: 'Game', web_app: {url: 'https://yummy-pianos-marry.loca.lt'}}],
                            ], resize_keyboard: true
                        }
                    })
                }
            } catch
                (e) {
                console.error('Ошибка при обработке сообщения:', e);
                try {
                    await bot.sendMessage(chat_id, 'Произошла какая то ошибка');
                } catch (error) {
                    if (error.code === 'ETELEGRAM' && error.response.error_code === 403) {
                        console.log(`Пользователь ${chat_id} заблокировал бота.`);
                    } else {
                        console.error('Ошибка при отправке сообщения:', error);
                    }
                }

            }

            // console.log(msg)
        }
    )
    // bot.on('callback_query', msg => {
    //     console.log('callback_query', msg)
    // })
}

start_bot().then();
// async function createUserIfNotExists(chat_id) {
//     try {
//         // Пытаемся найти пользователя с заданным chatId
//         const existingUser = await UserModel.findOne({chatId: chat_id});
//
//         // Если пользователь найден, возвращаем его
//         if (existingUser) {
//             console.log('Пользователь уже существует:', existingUser);
//             return existingUser;
//         }
//
//         // Если пользователя не существует, создаем его
//         const newUser = await UserModel.create({chatId: chat_id});
//         console.log('Создан новый пользователь:', newUser);
//         return newUser;
//     } catch (error) {
//         console.error('Ошибка при создании пользователя:', error);
//         throw error;
//     }
// }

// app.get('/points', async (req, res) => {
//     try {
//         const {chatId} = req.query;
//
//         // Логирование входных данных для отладки
//         console.log('req', chatId);
//         console.log('reqQuery', req.query);
//
//         // Поиск пользователя в базе данных
//         const user = await UserModel.findOne({where: {chatId}});
//
//         if (!user) {
//             // Если пользователь не найден, возвращаем 404
//             return res.status(404).json({error: 'User not found'});
//         }
//
//         // Логирование найденного пользователя
//         console.log('req2', user);
//
//         // Возвращаем количество очков пользователя
//         res.json({points: user.dataValues.points});
//
//     } catch (error) {
//         // Обработка ошибок
//         console.error('Error fetching points:', error);
//         res.status(500).json({error: 'Internal Server Error'});
//     }
// });
//
// app.post('/set-points', async (req, res) => {
//     const {chatId, points} = req.body;
//     await UserModel.update({points}, {where: {chatId}});
//     console.log('req', chatId)
//     console.log('reqbody', points)
//     // console.log('req2', user)
// })
//
// const port = 8000
// app.listen(port, () => {
//     console.log(`Server is online on port: ${port}`)
// })
