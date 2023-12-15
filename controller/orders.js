const OrdersModel = require("../models/Orders")

const addOrder = async(req, res)=>{
    try{
        const { email, cartItems, shippingAddress, cartTotalQuantity, userID, orderStatus, cartTotalAmount } = req.body;
        const Orders = await OrdersModel.create({
            email,
            cartItems,
            shippingAddress,
            cartTotalQuantity,
            userID,
            orderStatus,
            cartTotalAmount
        })
        res.json({Orders})
    }catch (err) {
        console.log("orders err:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getOrder = async(req, res)=>{
    try{
        const {email, cartItems, shippingAddress, cartTotalQuantity, userID, orderStatus, cartTotalAmount} = req.query;
        const query = {}
        if (userID) query.userID = userID;
        if (email) query.email = email;
        if (cartItems) query.cartItems = cartItems;
        if (shippingAddress) query.shippingAddress = shippingAddress;
        if (cartTotalQuantity) query.cartTotalQuantity = cartTotalQuantity;
        if (orderStatus) query.orderStatus = orderStatus;
        if (cartTotalAmount) query.cartTotalAmount = cartTotalAmount;
        const findOrders = await OrdersModel.find(query)
        res.json(findOrders)

    }catch{
        res.send("get order error part")
    }
}

const getSingleOrder = async(req, res)=>{
    try{
        const {id} = req.params
        const order = await OrdersModel.findById(id)
        res.json(order);
    }catch (error) {
        res.status(500).json({ error: 'error editing order status' });
    }
}

const editOrder = async(req, res)=>{
    try{
        const {id} = req.params
        const {orderStatus} = req.body
        const status = await OrdersModel.findByIdAndUpdate(id, {orderStatus})
        res.json(status)
    }catch (error) {
        res.status(500).json({ error: 'error editing order status' });
    }
}

module.exports = {
    addOrder,
    getOrder,
    editOrder,
    getSingleOrder,
}