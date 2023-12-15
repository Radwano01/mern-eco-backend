const { addOrder, getOrder, getSingleOrder, editOrder } = require("../controller/orders");

const router = require("express").Router();

router.post("/orders", addOrder)
router.get("/orders", getOrder)
router.get("/order-detail/:id", getSingleOrder)
router.put("/change-status/:id", editOrder)


module.exports = {router}