const UsersModel = require("../models/Users")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")


const register = async(req,res)=>{
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
                        user: process.env.EMAIL,
                        pass: process.env.PASS,
                    },
                });
    
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'Email Verification',
                    text: `Click the following link to verify your email: <p><a href="https://mern-eco-shop.netlify.app/verify/${email}/${verificationToken}">Click here to proceed</a></p>`,
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
}
const verifyEmail = async (req, res) => {
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
};

const login =  async (req, res) => {
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
};

const forgotPassword = async (req, res) => {
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
                user: process.env.EMAIL,
                pass: process.env.PASS
            }
        });
        
        const mailOptions = {
            from: process.env.EMAIL,
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
};


const resetPassword = (req, res) => {
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
};

module.exports={
    register,
    login,
    resetPassword,
    forgotPassword,
    verifyEmail
}
