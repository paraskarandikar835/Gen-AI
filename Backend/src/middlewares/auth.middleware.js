const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

async function authUser(req, res, next) {

    try {

        let token = null;


        // Get token from cookie
        if (req.cookies?.token) {

            token = req.cookies.token;

        }


        // Get token from Authorization header
        if (!token && req.headers.authorization) {

            const authHeader = req.headers.authorization;

            if (authHeader.startsWith("Bearer ")) {

                token = authHeader.split(" ")[1];

            }

        }


        if (!token) {

            return res.status(401).json({

                message: "Authentication token is required"

            });

        }



        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );



        // IMPORTANT: Your token uses userId
        const userId = decoded.userId;


       


        const user = await userModel.findById(userId);


        if (!user) {

            return res.status(401).json({

                message: "User not found"

            });

        }


        // Attach logged-in user
        req.user = user;


        console.log(
            "AUTHENTICATED USER:",
            req.user._id
        );


        next();

    } catch (error) {

        console.error(
            "AUTHENTICATION ERROR:",
            error.message
        );


        return res.status(401).json({

            message: "Invalid or expired token"

        });

    }

}


module.exports = {

    authUser

};