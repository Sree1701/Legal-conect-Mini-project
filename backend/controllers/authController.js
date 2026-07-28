const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {

    try {

        const { name, email, phone, password, role } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists with this email"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({

            name,

            email,

            phone,

            password: hashedPassword,

            role: role || "client"

        });

        res.status(201).json({
            message: "Registration Successful",
            user
        });

    }

    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(400).json({
                message: "Invalid Email"
            });

        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {

            return res.status(400).json({
                message: "Invalid Password"
            });

        }

        const token = jwt.sign(

            {
                id: user._id,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );

        res.json({

            message: "Login Successful",

            token,

            user

        });

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};