import express from "express"
import multer from "multer"
import cloudinary from "../config/cloudinary.js"

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post("/", upload.single("image"), async (req,res)=>{

  try{

    const file = req.file

    const result = await cloudinary.uploader.upload_stream(
      { folder:"rentwala" },
      (error, result) => {
        if(error){
          return res.status(500).json({error})
        }

        res.json({
          url: result.secure_url
        })
      }
    )

    result.end(file.buffer)

  }catch(err){
    console.log(err)
    res.status(500).json({error:"Upload failed"})
  }

})

export default router
