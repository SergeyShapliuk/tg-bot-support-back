require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const UserModel = require('./models');

const TelegramBot = require("node-telegram-bot-api");

// const token = process.env.BOT_TOKEN;
const token = '7546029935:AAFolPgihwYReqSbIEgGVgUpIUZiM1MWYVA';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());


const start_bot = async () => {

    try {
        await sequelize.authenticate();
        await sequelize.sync();

    } catch (e) {
        console.log('Ошибка подключения к базе данных', e)
    }

    bot.setMyCommands([
        {command: 'start', description: 'Запуск бота'},
        {command: 'info', description: 'Info'},
    ]).then(res => console.log('res', res))

    bot.on('message', async msg => {
        const text = msg.text
        const chat_id = msg.chat.id
        try {
            if (text === '/start') {
                // await sequelize.truncate();
                await createUserIfNotExists(chat_id)
                await bot.sendSticker(chat_id, `https://data.chpic.su/stickers/h/HelloDigitalWorld/HelloDigitalWorld_001.webp?v=1709113684`)
                await bot.sendMessage(chat_id, `Добро пожаловать ${msg.from.first_name}`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: 'Мини игра', web_app: {url: 'https://lucky-moles-rhyme.loca.lt'}}]
                        ], resize_keyboard: true
                    }
                })
            }
            if (text === '/info') {
                const user = await UserModel.findOne({where: {chatId: chat_id}});
                console.log('pg', user)
                if (user.dataValues.chatId) {
                    await bot.sendMessage(chat_id, `Ваш id чата ${user.dataValues.chatId} ${user.dataValues.points} поинтов`);
                } else {
                    await bot.sendMessage(chat_id, 'Пользователь не найден');
                }
            }
            if (text === '/portfolio') {
                await bot.sendMessage(chat_id, `https://sergeyshapliuk.github.io/portfolio/`)
            }
        } catch (e) {
            return bot.sendMessage(chat_id, 'Произошла какая то ошибка');
        }

        console.log(msg)
    }),
        bot.on('callback_query', msg => {
            console.log('callback_query', msg)
        })
}

start_bot()

async function createUserIfNotExists(chat_id) {
    try {
        // Пытаемся найти пользователя с заданным chatId
        const existingUser = await UserModel.findOne({chatId: chat_id});

        // Если пользователь найден, возвращаем его
        if (existingUser) {
            console.log('Пользователь уже существует:', existingUser);
            return existingUser;
        }

        // Если пользователя не существует, создаем его
        const newUser = await UserModel.create({chatId: chat_id});
        console.log('Создан новый пользователь:', newUser);
        return newUser;
    } catch (error) {
        console.error('Ошибка при создании пользователя:', error);
        throw error;
    }
}

app.get('/points', async (req, res) => {
    try {
        const { chatId } = req.query;

        // Логирование входных данных для отладки
        console.log('req', chatId);
        console.log('reqQuery', req.query);

        // Поиск пользователя в базе данных
        const user = await UserModel.findOne({ where: { chatId } });

        if (!user) {
            // Если пользователь не найден, возвращаем 404
            return res.status(404).json({ error: 'User not found' });
        }

        // Логирование найденного пользователя
        console.log('req2', user);

        // Возвращаем количество очков пользователя
        res.json({ points: user.dataValues.points });

    } catch (error) {
        // Обработка ошибок
        console.error('Error fetching points:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/set-points', async (req, res) => {
    const {chatId, points} = req.body;
    await UserModel.update({points}, {where: {chatId}});
    console.log('req', chatId)
    console.log('reqbody', points)
    // console.log('req2', user)
})

const port = 8000
app.listen(port, () => {
    console.log(`Server is online on port: ${port}`)
})
