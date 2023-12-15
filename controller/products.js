const ProductModel = require("../models/Products")


const addProduct = async(req, res)=>{
    try{
        const {name, brand, desc, image, price, category} = req.body;
        const createdAt = new Date();
        const postProduct = await ProductModel.create({name, brand, desc, price, image, createdAt, category})
        res.json(postProduct)
    }catch(err){
        res.json({err})
    }
}

const getProduct = async (req, res) => {
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
};

const getSingleProduct = async (req, res) => {
    const {id} = req.params
    try {
        const getProduct = await ProductModel.findById(id);
        res.json(getProduct);
    } catch (err) {
        res.json({ err });
    }
};


const editProduct = async(req, res)=>{
    try{
        const {id} = req.params
        const {name, brand, desc, price, image, category} = req.body;
        const editProduct = await ProductModel.findByIdAndUpdate({_id: id} , {name, brand, desc, price, image, category})
        res.json({editProduct})
    }catch(err){
        res.json({err})
    }
}

const deleteProduct = async(req, res)=>{
    try{
        const {id} = req.params
        const deleteProduct = await ProductModel.findByIdAndDelete(id)
        res.json({deleteProduct})
    }catch(err){
        res.json({err})
    }
}

module.exports = {
    addProduct,
    getProduct,
    getSingleProduct,
    editProduct,
    deleteProduct
}