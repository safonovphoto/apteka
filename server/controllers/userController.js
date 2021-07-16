const { User } = require('../models/models')

class userControllers {
  async create(req, res, next){
      const { chatId, username } = req.body
      const user = await User.create({chatId: chatId, username: username})
      return res.json({message: 'newUser', mainUserId: null, user: user})
  }

  async getOne(req, res) {
    const {id} = req.params
    const user = await User.findOne({where: {id: id}})
    return res.json(user)
  }
  
  async getOnePOST(req, res, next) {
    const {chatId} = req.body
    const user = await User.findOne({where: {chatId: chatId}})
    if (!user) {
      next()
    } else {
      if (user.mainUserId) return res.json({message: 'oldUser', mainUserId: user.mainUserId, user: user})
      return res.json({message: 'oldUser without group', mainUserId: null, user: user})
    }
  }

  async getAll(req, res) {
    const users = await User.findAll()
    return res.json(users)
  }
}
module.exports = new userControllers()