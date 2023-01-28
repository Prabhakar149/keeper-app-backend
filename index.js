const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const res = require("express/lib/response");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

//Database
// mongoose.connect("mongodb://localhost:27017/keeperAppDB", { useNewUrlParser: true });
mongoose.connect("mongodb+srv://admin-ps:Prabhakar10798@cluster0.qiqfd.mongodb.net/keeperAppDB", { useNewUrlParser: true });


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    emailId: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    notes: [{ title: String, content: String }]
});

const User = new mongoose.model("User", userSchema);


app.get("/", function (req, res) {
    res.send("Hi Keeper app");
});

app.post("/login", function (req, res) {
    const { emailId, password } = req.body;
    User.findOne({ emailId: emailId }, function (err, user) {
        if (user) {
            if (password === user.password) {
                res.send({ message: "Login successfull", user: user });
            } else {
                res.send({ message: "Password didn't match" });
            }
        } else {
            res.send({ message: "User is not registered" });
        }
    });
});

app.post("/register", function (req, res) {
    const { name, email, password } = req.body;

    User.findOne({ emailId: email }, function (err, user) {
        if (user) {
            res.send({ message: "User already registered" });
        } else {
            const myUser = new User({
                name: name,
                emailId: email,
                password: password
            });
            myUser.save((err) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ message: "Successfully registered, Please now login" });
                }
            })
        }
    });
});

app.post("/create", function (req, res) {
    const userNote = req.body;
    const [logInUser, myNote] = userNote;

    User.updateOne(
        { _id: logInUser._id },
        { $push: { notes: myNote } },
        function (err) {
            if (err) {
                res.send(err);
            } else {
                res.send({ message: "Your note is successfully added" });
            }
        }
    );



});

app.post("/updateNote", function (req, res) {
    const id = req.body._id;

    User.findOne(
        { _id: id }, function (err, myUser) {
            if (myUser) {
                res.send({ currentUser: myUser });
            } else {
                res.send(err);
            }
        }
    )
});

app.post("/delete", function (req, res) {
    const currentUserNote = req.body;
    const [currentUser, id] = currentUserNote;
    User.findOneAndUpdate({ _id: currentUser._id },
        {$pull:{notes:{_id:id}}},
        function (err, newUserNote) {
            if (err) {
                res.send(err);
            }else{
                res.send({ message: "Your note is successfully deleted"});
            }
        }
    );

});


app.post("/noteUpdate", function(req,res){
    const myNewNote = req.body;
    const [noteIndex, userId, noteTitle, noteContent, myNoteId] = myNewNote;

    User.findOneAndUpdate(
        { _id: userId, "notes._id":myNoteId},
        {
            $set: {
                "notes.$.title": noteTitle,
                "notes.$.content": noteContent,
             }
        },
        function (err, newUserNote) {
            if (err) {
                res.send(err);
            }else{
                res.send({ message: "Your note is successfully updated"});
            }
        }
    )
})



let port = process.env.PORT;
if (port == null || port == "") {
    port = 9002;
}
app.listen(port, function () {
    console.log("Server started succeessfully..");
})

// Export the Express API
module.exports = app;