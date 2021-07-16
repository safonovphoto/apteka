const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')

router.post('/', userController.getOnePOST, userController.create)
router.get('/:id', userController.getOne)
router.get('/', userController.getAll)

module.exports = router