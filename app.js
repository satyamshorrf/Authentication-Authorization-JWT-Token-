const express = require('express');
const app = express();
const userModel = require("./models/user");
const cookieParser = require('cookie-parser');
const path = require('path');
const bcrpt = require('bcrpt');
const jwt = require('jsonwebtoken');


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());



app.get("/", (req, res) => {
    res.render("index");
}); 

app.post("/create", async (req, res) => {
    let { username, email, password, age } = req.body;

    bcrpt.genSalt(10, (err, salt) => {
        bcrpt.hash(password, salt, async (err, hash) => {
            let createdUser = await userModel.create({
                username,
                email,
                password: hash,
                age
            }) 

        
            res.send(createdUser);

        })
    })
});

app.get("/login", async function (req, res) {
    let user = await userModel.findOne({email: req.body.email});
    if(!user) return res.send("something is wrong");

    bcrpt.compare(req.body.password, user.password, function (err, result) {
        if(result) {
            let token = jwt.sign({email: user.email}, "shhhhhhhhhhhhh");
            res.cookie("token", token);
        }   res.send("yes you can login");
        else res.send("something is wrong");

    })

});

app.get("/logout", function(req, res){
    res.cookie("token", "");
    res.redirect('/');
});



app.listen(8080, () => {
    console.log("Listening to port : 8080");
});