const { addProduct, getProduct, getSingleProduct, editProduct, deleteProduct } = require("../controller/products");

const router = require("express").Router();

router.post("/products", addProduct)
router.get("/products", getProduct)
router.get("/product-details/:id", getSingleProduct)
router.put("/products/:id", editProduct)
router.delete("/products/:id", deleteProduct)

module.exports = {router}
