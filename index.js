const express=require('express')
const cors=require('cors')
const mongoose=require('mongoose')
const app=express();
const port=3000;
const cookieParser=require("cookie-parser")
const Products = require('./Products');
const User = require('./User')
const Order = require('./Order')
const stripe=require('stripe')("sk_test_51OGxRMSFUsUMP2fZGEzk51GnF0mlq7x0ml4TulkGSNEJ9ey8KJxjXZU9tTMrPL339OPBxic7Nglm1iuz1ySbnwRJ0024M5sewp")
app.use(express.json());
app.use(cookieParser())
const authenticate=require("./middleware/authenticate.js")

const bcrypt=require('bcryptjs')



//deploy on github
// const path=require('path')

//static files access deploy on github
//app.use(express.static(path.join(__dirname,'./client/build')))
// app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

const corsOptions = {
   // origin: 'http://localhost:3001',
   origin: '*',   //allow request from any origin
    credentials: true, // <-- Add this line
    
  }
  
  app.use(cors(corsOptions));

//   app.options('*', (req, res) => {
//     res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type');
//     res.header('Access-Control-Allow-Credentials', true);
//     res.send();
//   });
const jwt=require('jsonwebtoken');
require('dotenv').config();





// connection url
const connection_url="mongodb+srv://aroravidhi35:Vidhi%40123@amazon.kih94xy.mongodb.net/Amazon?retryWrites=true&w=majority"

mongoose.connect(connection_url,{
    useNewUrlParser:true,
    useUnifiedTopology:true,

}).then(()=>{
    console.log('successful')
}).catch((err)=>console.log(err))


// API
//app.get("/",(req,res)=> res.status(200).send("home page !"));


//register
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;



    if (!name || !email || !password ) {
        return res.status(422).json({ error: "fill all details" })
    }

    try {
    const userExist=await User.findOne({ email: email });
    if (userExist) {
        return res.status(422).json({ error: "Email already exists" })
    }else{
        const user = new User({ name, email, password });
        const userRegistered=await user.save();
        res.status(201).json({ message: "User registered successfully" })
    }
    } catch (err) {
        console.log(err);
    }


})


//login
app.post('/login', async (req, res) => {
    const {  email,  password } = req.body;



    if ( !email ||  !password ) {
        return res.status(400).json({ error: "fill all details" })
    }

    try {
    const userExist=await User.findOne({ email: email });

    if(userExist){
        
        const isMatch=await bcrypt.compare(password,userExist.password)
        const token=await userExist.generateAuthToken();
        console.log(token);

 

        res.cookie('jwtoken',token, {httpOnly: true, sameSite: 'none', secure: true })


      
     

    if (isMatch) {
       // console.log(userExist)
       // console.log(userExist.name)
        return res.status(200).json({ message: "logged in successfully",name:userExist.name })
    }

    else{
        return res.status(422).json({ error: "invalid credentials " })
    }
    }else{
        return res.status(422).json({ error: "invalid credentials" })
    }
    } catch (err) {
        console.log(err);
    }


})




// add product
app.post('/products/add', authenticate,async (req, res) => {
    try {
        const productDetail = req.body;
        const data = await Products.create(productDetail);
        res.status(201).send(data);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// get products
app.get('/products/get', async (req, res) => {
    try {
       
        const data = await Products.find();
        res.status(201).send(data);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// api for payment
app.post('/payment/create', async (req, res) => {
    try {
        const total = req.body.amount;
        console.log(total);

        const payment = await stripe.paymentIntents.create({ amount: total*100, currency: 'inr' });

        res.status(201).send({
            clientSecret: payment.client_secret
        });
    } catch (err) {
        console.error('Error in payment route:', err);
        res.status(500).send(err.message);
    }
});



// api for order
app.post('/orders/add', async (req, res) => {
    try {
        const products=req.body.basket;
        const price=req.body.price;
        const email=req.body.email;
        const address=req.body.address;

        console.log("prod>>>>>>>>>>>>>>>>>>",products)

        const orderDetail={
            products:products,
            price:price,
            address:address,
            email:email,
        }

        console.log("orderDetail>>>>>>>>>>>>>>>>>>>>>>>",orderDetail)

        const result = await Order.create(orderDetail);
        console.log("Order added", result);
        res.status(201).send(result);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});





// api to get orders
app.post('/orders/get',authenticate, async (req, res) => {

        

    try {
        const email = req.body.email;
    
        const userOrders = await Order.find({ email: email });
    
        res.status(200).send(userOrders);
      } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
      }

});




// api to log out
app.get('/logout',(req,res)=>{
    res.clearCookie('jwtoken', { httpOnly: true, secure: true });
   
    res.status(200).send('user logout');
})




//deploying on github
// app.get('*',function(req,res){
//     res.sendFile(path.join(__dirname,'./client/build/index.html'))
// })

// app.get('*', function(req, res) {
//     res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
// });




app.listen(port,()=>console.log("listening on port ",port));