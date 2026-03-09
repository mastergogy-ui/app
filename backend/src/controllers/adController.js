import Ad from "../models/Ad.js";
import cloudinary from "../cloudinary.js";

export const getAds = async(req,res)=>{
try{
const ads = await Ad.find().sort({createdAt:-1});
res.json(ads);
}catch(err){
res.status(500).json({error:"Failed to fetch ads"});
}
};

export const createAd = async(req,res)=>{
try{

let imageUrl="";

if(req.file){
const result = await cloudinary.uploader.upload(req.file.path);
imageUrl=result.secure_url;
}

const ad = new Ad({
title:req.body.title,
description:req.body.description,
price:req.body.price,
location:req.body.location,
image:imageUrl
});

await ad.save();

res.json(ad);

}catch(err){
res.status(500).json({error:"Failed to create ad"});
}
};

