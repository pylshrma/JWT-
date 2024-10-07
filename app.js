const express = require("express");
const app = express();
const connectToDb = require("./config/mongodb");
connectToDb();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("./models/users");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("hellow frnd")
});

app.get("/register", (req, res) => {
    res.render("index");
});

app.post("/register", async (req, res, next) => {
    const { username, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new userModel({
        username,
        email,
        password: hash
    });

    await user.save()

    const token = jwt.sign({
        username: user.username,
        email: user.email
    }, process.env.JWT_KEY,)

    res.cookie("token", token)
    res.send(user)
});

app.get("/logout", (req, res, next) => {
    res.cookie("token", "");
    res.send("logged out");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res, next) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(401).send("user not found")
    }
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (isValidPassword) {
        const token = jwt.sign({
            username: user.username,
            email: user.email
        }, process.env.JWT_KEY,)

        res.cookie("token", token);
        res.send("logged in");
    } else {
        res.status(401).send("invalid password");
    }
});

function isLoggedIn(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).res.send("not authorized");
        }
        const decoded = jwt.verify(token, "secret")

        if (!decoded) {
            return res.status(401).res.send("not authorized");
        }
        req.user = decoded;
        return next();

    } catch (err) {
        return res.status(401).send("not authorized");

    }
};

app.get("/protected", isLoggedIn, (req,res,next)=>{
    res.send("protected route");
}); 

app.listen(3000, () => {
    console.log(`server is running at localhost:3000`);
});
