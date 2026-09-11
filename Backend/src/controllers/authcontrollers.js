// decides where the request should go based on the route and method

const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");


// REGISTER USER

async function registerUserController(req, res) {

    try {

        const { username, email, password } = req.body;


        // Validate input

        if (!username || !email || !password) {

            return res.status(400).json({

                message:
                    "Please provide username, email and password"

            });

        }


        // Check existing user

        const isUserAlreadyExists =
            await userModel.findOne({

                $or: [
                    { username },
                    { email }
                ]

            });


        if (isUserAlreadyExists) {

            return res.status(400).json({

                message:
                    "Account already exists with this email or username"

            });

        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user

        const user =
            await userModel.create({

                username,

                email,

                password:
                    hashedPassword

            });


        // Create JWT token

        const token =
            jwt.sign(

                {

                    userId:
                        user._id,

                    username:
                        user.username,

                    email:
                        user.email

                },

                process.env.JWT_SECRET,

                {

                    expiresIn:
                        "1d"

                }

            );


        // Save token in cookie

        res.cookie(

            "token",

            token,

            {

                httpOnly: true,

                sameSite: "lax",

                secure:
                    process.env.NODE_ENV === "production",

                maxAge:
                    24 * 60 * 60 * 1000

            }

        );


        return res.status(201).json({

            message:
                "User registered successfully",

            user: {

                id:
                    user._id,

                username:
                    user.username,

                email:
                    user.email

            }

        });


    } catch (error) {

        console.error(
            "Register Error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to register user",

            error:
                error.message

        });

    }

}


// LOGIN USER

async function loginUserController(req, res) {

    try {

        const { email, password } =
            req.body;


        // Validate input

        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Email and password are required"

            });

        }


        // Find user

        const user =
            await userModel.findOne({

                email

            });


        if (!user) {

            return res.status(400).json({

                message:
                    "Invalid email or password"

            });

        }


        // Compare password

        const isMatch =
            await bcrypt.compare(

                password,

                user.password

            );


        if (!isMatch) {

            return res.status(400).json({

                message:
                    "Invalid email or password"

            });

        }


        // Create JWT

        const token =
            jwt.sign(

                {

                    userId:
                        user._id,

                    username:
                        user.username,

                    email:
                        user.email

                },

                process.env.JWT_SECRET,

                {

                    expiresIn:
                        "1d"

                }

            );


        // Save token in cookie

        res.cookie(

            "token",

            token,

            {

                httpOnly: true,

                sameSite: "lax",

                secure:
                    process.env.NODE_ENV === "production",

                maxAge:
                    24 * 60 * 60 * 1000

            }

        );


        res.status(200).json({
        message: "User logged in successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
  },
});

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to login",

            error:
                error.message

        });

    }

}


// LOGOUT USER

async function logoutUserController(req, res) {

    try {

        const token =
            req.cookies.token;


        // Add token to blacklist

        if (token) {

            await tokenBlacklistModel.create({

                token

            });

        }


        // Clear cookie

        res.clearCookie(

            "token",

            {

                httpOnly: true,

                sameSite: "lax",

                secure:
                    process.env.NODE_ENV === "production"

            }

        );


        return res.status(200).json({

            message:
                "User logged out successfully"

        });


    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to logout",

            error:
                error.message

        });

    }

}


// GET CURRENT USER

async function getMeController(req, res) {

    try {

        const userId =
            req.user._id ||
            req.user.userId;


        const user =
            await userModel

                .findById(userId)

                .select("-password");


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        return res.status(200).json({

            message:
                "User details fetched successfully",

            user: {

                id:
                    user._id,

                username:
                    user.username,

                email:
                    user.email

            }

        });


    } catch (error) {

        console.error(
            "Get Me Error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to fetch user details",

            error:
                error.message

        });

    }

}


module.exports = {

    registerUserController,

    loginUserController,

    logoutUserController,

    getMeController

};