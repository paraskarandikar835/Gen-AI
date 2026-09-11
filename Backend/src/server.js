require("dotenv").config();


const app =
    require("./app");


const connectToDB =
    require("./config/database");


const PORT =
    process.env.PORT || 3000;


async function startServer() {

    try {

        await connectToDB();


        app.listen(

            PORT,

            () => {

                console.log(
                    `Server is running on port ${PORT}`
                );

            }

        );


    } catch (error) {

        console.error(
            "Server startup error:"
        );

        console.error(error);


        process.exit(1);

    }

}


startServer();