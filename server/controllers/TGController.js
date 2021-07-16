const PORT = process.env.PORT || 5000
const fetch = require('node-fetch');

let chatId, username, groupId
const token = ''
const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(token, {polling: true})
const users = {}

const startBtns = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'Создать группу', callback_data: 'createGroup'}],
        [{ text: 'Обновить статус (когда Вас добавили в группу)', callback_data: 'checkInGroup'}],
      ]
    })
}

const startBtns2 = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'Обновить статус (когда Вас добавили в группу)', callback_data: 'checkInGroup'}],
      ]
    })
}

const medicineBtns = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: 'Витамины', callback_data: 'Витамины'}, { text: 'Обезболивающие', callback_data: 'Обезболивающие'}],
            [{ text: 'ОРЗ, ОРВИ', callback_data: 'ОРЗ'}, { text: 'Желудок', callback_data: 'Желудок'}],
            [{ text: 'Женское', callback_data: 'Женское'}, { text: 'Обработка ран', callback_data: 'Обработка ран'}],
            [{ text: 'Крема, мази', callback_data: 'Крема'},{ text: 'Аллергия', callback_data: 'Аллергия'}],
            [{ text: 'Для животных', callback_data: 'Животные'}],
        ]
    })
}

const actionBtns = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
        [{ text: 'Показать всё', callback_data: 'Показать всё'}, { text: 'Добавить', callback_data: 'Добавить'}],
        [{ text: 'Посмотреть с истекающим сроком годности', callback_data: 'Срок годности'}, { text: 'Список покупок', callback_data: 'Список покупок'}],
        [{ text: 'Назад', callback_data: 'Список лекарств'}],
    ]
  })
}

const productBtns = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
        [{ text: 'В покупки', callback_data: 'Купить'}, { text: '- 1', callback_data: 'Минус1'}, { text: 'Изменить количество', callback_data: 'ИзменитьКоличество'}],
    ]
  })
}

class TGController {
    async running () {
        let waitingMessage = null
          
        bot.setMyCommands([
            {command: '/start', description: 'В начало'},
        ])
          
          bot.on('message', async msg => {
            const text = msg.text
            chatId = msg.chat.id
            username =  msg.chat.username
            let user = users[msg.chat.id]
            if (text === '/start') {
              const createUser = await sendPostMessage('user/', {chatId: chatId, username: username})
              if (!users[createUser.user.chatId]) users[createUser.user.chatId] = createUser.user
              await bot.sendSticker(chatId, 'https://cdn.tlgrm.ru/stickers/34a/06e/34a06ee8-aa17-422f-bc4b-0e6034a57c4f/2.webp')
              await bot.sendMessage(chatId, 'Добро пожаловать на страницу Аптечка! Выберите группу лекарств', medicineBtns)

              // if (createUser.message === 'newUser') {
              //   await bot.sendSticker(chatId, 'https://cdn.tlgrm.ru/stickers/34a/06e/34a06ee8-aa17-422f-bc4b-0e6034a57c4f/2.webp')
              //   await bot.sendMessage(chatId, 'Добро пожаловать на страницу Аптечка! Создайте группу или попросите другого пользователя добавить Вас в уже существующую группу', startBtns)
              // } else if (createUser.message === 'oldUser without group') {
              //   await bot.sendMessage(chatId, 'С возвращением! Создайте группу или попросите другого пользователя добавить Вас в уже существующую группу', startBtns)
              // } else {
              //   groupId = createUser.groupId
              //   await bot.sendMessage(chatId, 'С возвращением! Воспользуйтесь меню для выбора лекарств', medicineBtns)
              // }
            }
            if (user.action === 'name') {
              user.add.name = text
              user.action = 'quantity'
              await bot.sendMessage(chatId, 'Введите количество')
            }
            if (user.action === 'quantity' && text !== user.add.name) {
              user.add.quantity = text
              user.action = 'expirationDate'
              await bot.sendMessage(chatId, 'Введите дату в формате ММГГ')
            }
            if (user.action === 'expirationDate' && text !== user.add.quantity) {
              if (text.length !== 4){
                await bot.sendMessage(chatId, 'Недопустимый формат даты. Введите дату в формате ММГГ')
              } else {
                user.add.expirationDate = new Date(`20${text.slice(2, 4)}`, text.slice(0, 2))
                const createMedicine = await sendPostMessage('product/', {expirationDate: user.add.expirationDate, name: user.add.name, quantity: user.add.quantity, userId: user.id, type: user.selectedType})
                if (createMedicine) user.add = {}
                await bot.sendMessage(chatId, `Сохранено! ${user.selectedType}:`, actionBtns)
              }
            }
          })
          
          bot.on('callback_query', async msg => {
            const user = users[msg.message.chat.id]
            switch (msg.data) {
              case 'createGroup': 
                action = await sendPostMessage('user/createGroup/', {chatId: chatId}, 'PUT')
                groupId = action.groupId
                await bot.sendMessage(chatId, 'Отлично! Теперь воспользуйтесь меню для выбора лекарств', medicineBtns)
                break
              case 'addToGroup': {
                await bot.sendMessage(chatId, 'Вначале пользователь должен запустить этот бот, потом введите его логин в поле ниже')
                waitingMessage = 'waitingAddToGroup'
                break
              }
              case 'checkInGroup':
                action = await sendPostMessage('group/checkUserInGroup/', {chatId: chatId})
                if (action) {
                    groupId = action.groupId
                    await bot.sendMessage(chatId, 'Вас добавили в группу! Воспользуйтесь меню для выбора лекарств', medicineBtns)
                } else {
                    await bot.sendMessage(chatId, 'Попробуйте еще раз', startBtns2)
                }
                break
              case 'Витамины': 
                user.selectedType = 'Витамины'
                await bot.sendMessage(chatId, 'Витамины', actionBtns)
                break
              case 'Обезболивающие': 
                user.selectedType = 'Обезболивающие'
                await bot.sendMessage(chatId, 'Обезболивающие', actionBtns)
                break
              case 'ОРЗ': 
                user.selectedType = 'ОРЗ'
                await bot.sendMessage(chatId, 'ОРЗ', actionBtns)
                break
              case 'Желудок': 
                user.selectedType = 'Желудок'
                await bot.sendMessage(chatId, 'Желудок', actionBtns)
                break
              case 'Женское': 
                user.selectedType = 'Женское'
                await bot.sendMessage(chatId, 'Женское', actionBtns)
                break
              case 'Обработка ран': 
                user.selectedType = 'Обработка ран'
                await bot.sendMessage(chatId, 'Обработка ран', actionBtns)
                break
              case 'Крема': 
                user.selectedType = 'Крема'
                await bot.sendMessage(chatId, 'Крема', actionBtns)
                break
              case 'Аллергия': 
                user.selectedType = 'Аллергия'
                await bot.sendMessage(chatId, 'Аллергия', actionBtns)
                break
              case 'Животные': 
                user.selectedType = 'Животные'
                await bot.sendMessage(chatId, 'Животные', actionBtns)
                break
              case 'Добавить': 
                user.add = {}
                user.action = 'name'
                await bot.sendMessage(chatId, 'Введите название')
                break
              case 'Показать всё': 
                user.add = {}
                user.action = 'showAll'
                const showAll = await sendPostMessage('product/showAll/', {userId: user.id, type: user.selectedType})
                let i = 1
                for (let item of showAll) {
                  const year = item.expirationDate.slice(2, 4)
                  let month = String(+(item.expirationDate.slice(5, 7)) - 1)
                  month = month.length === 1 ? `0${month}` : month
                  // let month = item.expirationDate.slice(5, 7)
                  bot.sendMessage(chatId, `${i}: ${item.name}, \nКоличество: ${item.quantity}, \nСрок годности: ${month}/${year}`, productBtns)
                  i++
                }
                
            }
          })
          
          async function sendPostMessage (address, data) {
            try {
              const response = await fetch(`http://localhost:${PORT}/api/${address}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(data)
              })
              const result = await response.json()
              if (response.ok) {
                return result
              } else {
                return result
              }
            } catch (e) {
              return e
            }
          }
    }
}

module.exports = new TGController