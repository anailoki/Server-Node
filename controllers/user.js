const bcrypt = require("bcrypt-node");
const jwt = require('../services/jwt');
const User = require("../models/user");

function signUp(req, res) {
   const user = new User();

   const {name, lastName, email, password, repeatPassword} = req.body;

   user.name = name;
   user.lastname = lastName;
   user.email = email.toLowerCase();
   user.role = "admin";
   user.active = false;

   if(!password || !repeatPassword){
      res.status(404).send({message: "Password is required"});
   }else{
      if(password !== repeatPassword){
         res.status(404).send({message: "Password is not equals"});
      }else{
         bcrypt.hash(password, null, null, function(err, hash){
            if(err){
               res.status(500).send({message: "Encrypt password error"});
            }else{
               user.password = hash;
               
               user.save((err, userStored) =>{
                  if(err){
                     res.status(500).send({message: "User exist"});
                  }else{
                     if(!userStored){
                        res.status(404).send({message: "Create user error"});
                     }else{
                        res.status(200).send({user: userStored});

                     }
                  }
               });
            }
         })
      }
   }


}

function signIn(req, res) {
   const params = req.body;
   const email = params.email.toLowerCase();
   const password = params.password;

   User.findOne({email}, (err, userStored) =>{
      if(err) {
         res.status(500).send({message: "Server Error"});
      } else {
         if(!userStored) {
            res.status(404).send({message: "User not find"});
         } else {
            bcrypt.compare(password, userStored.password, (err, check) => {
               if(err) {
                  res.status(500).send({message: "Server Error"});
               } else if(!check){
                  res.status(404).send({message: "Password is incorrect"})
               } else {
                  if(!userStored.active) {
                     res.status(200).send({message: "User is not active"})
                  } else {
                     res.status(200).send({
                        accessToken: jwt.createAccessToken(userStored),
                        refreshToken: jwt.createRefreshToken(userStored)
                     });
                  }
               }
            });
         }
      }
   })
}

module.exports = {
   signUp,
   signIn
}