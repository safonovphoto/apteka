const { Op } = require('sequelize')
const { ProductsInHome } = require('../models/models')

class productController {
  async create(req, res, next){
      const { name, expirationDate, quantity, userId, type } = req.body
      const product = await ProductsInHome.create({name: name, expirationDate: expirationDate, quantity: quantity, userId: userId, type: type})
      return res.json(product)
  }

  async getOne(req, res) {
    const {id} = req.params
    const product = await ProductsInHome.findOne({where: {id: id}})
    return res.json(product)
  }

  async getAll(req, res) {
    const products = await ProductsInHome.findAll()
    return res.json(products)
  }

  async getAllByType(req, res) {
    const {type, userId} = req.body
    const products = await ProductsInHome.findAll({where: {[Op.and]: [{type: type}, {userId: userId}]} })
    return res.json(products)
  }
}
module.exports = new productController()