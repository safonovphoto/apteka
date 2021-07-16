const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const productTreeRouter = require('./productTreeRouter')
const productRouter = require('./productRouter')

router.use('/user', userRouter)
router.use('/productTree', productTreeRouter)
router.use('/product', productRouter)

module.exports = router
