const bcrypt = require("bcrypt-node");
const User = require("../models/user");

function signUp(req, res){
   const user = new User();

   const {name, lastName, email, password, repeatPassword} = req.body;

   user.name = name;
   user.lastname = lastName;
   user.email = email;
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
                        res.status(200).send({message: userStored});

                     }
                  }
               });
            }
         })
      }
   }


}

module.exports = {
   signUp
}