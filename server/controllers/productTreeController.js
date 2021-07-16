const { ProductTree } = require('../models/models')

class productTreeController {
  async create(req, res, next){
      const { parentId, name } = req.body
      const tree = await ProductTree.create({name: name, parentId: parentId})
      return res.json(tree)
  }

  async getOne(req, res) {
    const {id} = req.params
    const tree = await ProductTree.findOne({where: {id: id}})
    return res.json(tree)
  }

  async getAll(req, res) {
    const trees = await ProductTree.findAll()
    return res.json(trees)
  }
}
module.exports = new productTreeController()