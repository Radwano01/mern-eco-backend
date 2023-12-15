const { register, login, verifyEmail, resetPassword, forgotPassword } = require("../controller/auth")

const router = require("express").Router()


router.post("/register", register)
router.post("/login", login)
router.get("/verify/:email/:verficationToken", verifyEmail)
router.post("/reset-password/:id/:token", resetPassword)
router.post("/forgot-password", forgotPassword)


module.exports = {router}