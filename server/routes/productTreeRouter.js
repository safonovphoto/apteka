const Router = require('express')
const router = new Router()
const productTreeController = require('../controllers/productTreeController')

router.post('/', productTreeController.create)
router.get('/', productTreeController.getAll)

module.exports = router