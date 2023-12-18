const express = require("express")
const app = express()
app.use(express.json({limit: "10mb"}))
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
require("dotenv").config()

const _PORT = 5000

const cors = require("cors")
app.use(cors())

require("dotenv").config()
const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    app.listen(_PORT, ()=>{
        console.log(`server activate successfully at ${_PORT}`)
    })
})
.catch((err)=>{
   console.log(err)
})

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const calculateOrderAmount = (items) => {
    let totalAmount = 0;
  
    items?.map((item) => {
      const { price, cartTotalQuantity } = item;
      const cartItemAmount = price * cartTotalQuantity;
      totalAmount += cartItemAmount;
    });
  
    return Math.ceil(totalAmount * 100);
  };

app.post("/payment", async (req, res) => {
  const { cartItems } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(cartItems),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

const authRoute = require("./routes/auth").router
const productsRoute = require("./routes/products").router
const ordersRoute = require("./routes/orders").router

app.use("/api", authRoute)
app.use("/api", productsRoute)
app.use("/api", ordersRoute)
