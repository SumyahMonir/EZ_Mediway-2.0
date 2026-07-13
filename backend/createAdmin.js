require("dotenv").config();

const dns = require("node:dns").promises;
dns.setServers(["1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserAuth = require("./models/userAuth");


const createAdmin = async()=>{

    try{

        await mongoose.connect(process.env.MONGO_URI);


        const password = await bcrypt.hash(
            "123456",
            10
        );

        const admin = await UserAuth.create({

            Email:"admin123@gmail.com",

            Password: "iamadmin",

            Role:"admin"

        });


        console.log("Admin Created Successfully");
        console.log(admin);

        mongoose.connection.close();

    }
    catch(error){

        console.log(error);

    }

}
createAdmin();