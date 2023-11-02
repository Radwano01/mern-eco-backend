const express = require("express")
const app = express()
app.use(express.json({limit: "10mb"}))


const _PORT = 5000

const cors = require("cors")
app.use(cors())

require("dotenv").config()
const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://radwan:radwan05366310123@cluster0.pykwxjr.mongodb.net/ecommerce?retryWrites=true&w=majority")
.then(()=>{
    app.listen(_PORT, ()=>{
        console.log(`server activate successfully at ${_PORT}`)
    })
})
.catch((err)=>{
    res.send(err)
})

const ProductModel = require("./models/Products")

app.post("/products", async(req, res)=>{
    try{
        const {name, brand, desc, image, price, category} = req.body;
        const createdAt = new Date();
        const postProduct = await ProductModel.create({name, brand, desc, price, image, createdAt, category})
        res.json(postProduct)
    }catch(err){
        res.json({err})
    }
})

app.get("/products", async (req, res) => {
    try {
        const { name, brand, desc, price, image, createdAt, category } = req.query;
        const query = {};

        if (name) query.name = name;
        if (brand) query.brand = brand;
        if (desc) query.desc = desc;
        if (price) query.price = price;
        if (image) query.image = image;
        if (createdAt) query.createdAt = createdAt;
        if (category) query.category = category;

        const getProduct = await ProductModel.find(query);
        res.json(getProduct);
    } catch (err) {
        res.json({ err });
    }
});

app.get("/product-details/:id", async (req, res) => {
    const {id} = req.params
    try {
        const getProduct = await ProductModel.findById(id);
        res.json(getProduct);
    } catch (err) {
        res.json({ err });
    }
});


app.put("/products/:id", async(req, res)=>{
    try{
        const {id} = req.params
        const {name, brand, desc, price, image, category} = req.body;
        const editProduct = await ProductModel.findByIdAndUpdate({_id: id} , {name, brand, desc, price, image, category})
        res.json({editProduct})
    }catch(err){
        res.json({err})
    }
})

app.delete("/products/:id", async(req, res)=>{
    try{
        const {id} = req.params
        const deleteProduct = await ProductModel.findByIdAndDelete(id)
        res.json({deleteProduct})
    }catch(err){
        res.json({err})
    }
})

const UsersModel = require("./models/Users")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")

app.post("/register", async(req,res)=>{
    try{
        const {email, password} = req.body;
        const validEmail = await UsersModel.findOne({email})
        if(validEmail){
            res.send("email valid")
        }else{
            await bcrypt.hash(password, 10)
            .then(async(hash)=>{
                const newUser = await UsersModel.create({email, password:hash})
                
                const verificationToken = jwt.sign({ email }, 'tokenOfId', { expiresIn: '1d' });
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: "www.radwaniq@gmail.com",
                        pass: "zhnxldnualdylzhu",
                    },
                });
    
                const mailOptions = {
                    from: "www.radwaniq@gmail.com",
                    to: email,
                    subject: 'Email Verification',
                    text: `Click the following link to verify your email: <p><a href="http://localhost:5000/verify/${email}/${verificationToken}">Click here to proceed</a></p>`,
                };
    
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        return res.status(500).json({ Status: 'Error', Error: 'Failed to send verification email' });
                    } else {
                        return res.json({ Status: 'Success', Message: 'Verification email sent' });
                    }
                });
            })
            .catch((err)=>{
                res.json({err})
            })
        }

    }catch(err){
        res.json({err})
    }
})
app.get('/verify/:email/:verificationToken', async (req, res) => {
    const { email, verificationToken } = req.params;
    try {
        const decoded = jwt.verify(verificationToken, 'tokenOfId');
        if (decoded.email === email) {
            await UsersModel.updateOne({ email }, { isVerified: true });
            return res.send('Email verified successfully');
        } else {
            return res.send('Invalid token');
        }
    } catch (error) {
        res.send(error)
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const checkEmail = await UsersModel.findOne({ email });
    if (!checkEmail) {
        return res.send("User not found. Please check your email.");
    }
    if (!checkEmail.isVerified) {
        return res.send("Account not verified. Please verify your email first.");
    }
    if (checkEmail) {
        const passwordTrue = bcrypt.compare(password, checkEmail.password);
        if (passwordTrue) {
            const token = jwt.sign({ id: checkEmail._id }, "tokenOfId");
            res.json({ token, id: checkEmail._id });
        } else {
            res.send("email or password is not correct");
        }
    } else {
        res.send("someting went wrong");
    }
});

app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    
    try {
        const checkEmail = await UsersModel.findOne({ email });
        
        if (!checkEmail) {
            return res.status(400).send("Email not found in the database");
        }
        
        const token = jwt.sign({ id: checkEmail._id }, "tokenOfId", { expiresIn: "1d" });
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "www.radwaniq@gmail.com",
                pass: "zhnxldnualdylzhu"
            }
        });
        
        const mailOptions = {
            from: "www.radwaniq@gmail.com",
            to: email,
            subject: 'Reset Password Link',
            text: `http://localhost:3000/reset-password/${checkEmail._id}/${token}`
        };
        
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error(error);
                return res.status(500).send("Email could not be sent");
            } else {
                return res.send({ Status: "Success" });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
});


app.post("/reset-password/:id/:token", (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    jwt.verify(token, "tokenOfId", (err, decoded) => {
        if (err) {
            return res.json({ Status: "Error with token" });
        } else {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    return res.send({ Status: "Error", Error: err });
                }
                UsersModel.findByIdAndUpdate({ _id: id }, { password: hash })
                    .then(u => res.json({ Status: "Success" }))
                    .catch(err => res.status(500).json({ Status: "Error", Error: err.message }));
            });
        }
    });
})

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const calculateOrderAmount = (items) => {
    let totalAmount = 0;
  
    items?.map((item) => {
      const { price, cartTotalQuantity } = item;
      const cartItemAmount = price * cartTotalQuantity;
      totalAmount += cartItemAmount;
    });
  
    return Math.ceil(totalAmount * 100); // Convert totalAmount to cents and round up
  };

app.post("/payment", async (req, res) => {
  const { cartItems } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(cartItems),
    currency: "usd",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

const OrdersModel = require("./models/Orders")
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.post("/orders", async(req, res)=>{
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
})

app.get("/orders", async(req, res)=>{
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
})

app.get("/order-detail/:id", async(req, res)=>{
    try{
        const {id} = req.params
        const order = await OrdersModel.findById(id)
        res.json(order);
    }catch (error) {
        res.status(500).json({ error: 'error editing order status' });
    }
})

app.put("/change-status/:id", async(req, res)=>{
    try{
        const {id} = req.params
        const {orderStatus} = req.body
        const status = await OrdersModel.findByIdAndUpdate(id, {orderStatus})
        res.json(status)
    }catch (error) {
        res.status(500).json({ error: 'error editing order status' });
    }
})