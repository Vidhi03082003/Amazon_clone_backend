const jwt=require("jsonwebtoken")
const User=require("../User")


const authenticate=async(req,res,next)=>{
    try{
        const token=req.cookies.jwtoken;
     // const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTY2MzJhNzZmYTAzYjRjOTBmYmE5NGMiLCJpYXQiOjE3MDE3MjIyOTh9.Vh4PdxMKTa9yfbShts_967NWO6BIYZ1iKUPVSBm4DN8"
        console.log('authenticate>>>>',token)
        console.log('Request Headers:', req.headers);
        const verifyToken=jwt.verify(token,"MYNAMEISVIDHIARORAHELLOHOWRY");

        const rootUser= await User.findOne({_id:verifyToken._id,"tokens.token":token});

        if(!rootUser){
            throw new Error('User not Found')
        }

        req.token=token;
        req.rootUser=rootUser;
        req.userID=rootUser._id;

        next();
    }catch(err){
        res.status(401).send("Unauthorized");
       // console.log(err)
    }
}

module.exports=authenticate;