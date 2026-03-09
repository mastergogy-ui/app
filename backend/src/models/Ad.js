import mongoose from "mongoose";

const AdSchema = new mongoose.Schema(
{
title:{type:String,required:true},
description:{type:String},
price:{type:Number,required:true},
image:{type:String},
location:{type:String}
},
{timestamps:true}
);

export default mongoose.model("Ad",AdSchema);

