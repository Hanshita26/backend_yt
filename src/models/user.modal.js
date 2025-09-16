import mongoose , {Schema} from 'mongoose'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
    {
    watchHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
    }],
        username:{
            type:String, 
            required:true,
            lowercase:true,
            unique:true,
            trim:true,
            index:true, // searchable optimisation
        },
        email:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true,

        },
        fullName:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            index:true,

        },
        avatar:{
            type:String, 
            required:true,// cloudinary string will be used

        },
        avatar_publicId:{
            type:String,
            required:true,
        },
        coverImage:{
            type:String,
        },
        coverImage_publicId:{
            type:String,
            required:true,
        },
        password:{
            type:String,
            required:[true,"password id required"],
            // validate:{
            //     validator:function(value){
            //         return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
            //     },
            //     message:"Enter a valid password",
            // }
        },
        refreshToken:{
            type:String,
            // required:true,
        }

    },
    
    {timestamps:true});

    // pre hook:-
    // dont use arrow function , because there we cannot use this keyword , which we highly need here
userSchema.pre("save",async function (next){

    if(!this.isModified("password")){
        return next();
    }// so that it dont encrypt again and again on every reloading

    this.password= await bcrypt.hash(this.password,10);
    next();
    // this takes 2 fields - kis chiz ko hash karna hai and how many rounds of hashing

});

// custom methods can also be created using .methods.
// we are comparing passwords

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
    // returns in true and false
}



userSchema.methods.generateAccessToToken= function(){

    // it takes 3 things - payload,token key and its expiry
   return jwt.sign(
        {
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName,

    },
    process.env.ACCESS_TOKEN_SECRETKEY,
    {
        expiresIn:process.env.ACESS_TOKEN_EXPIRY,
    }

)

}

userSchema.methods.generateRefreshToken= function(){

  return  jwt.sign(
        {
            // less info
            _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
)
    
}

export const User=mongoose.model("User",userSchema);

// token - jwt (json web token)
// bcrypt - for hashing of password


// so jsonwebtoken cannot be applied directly , we need to use mongoose hooks - 
// one of them is PRE - ki for instance user wants to save password , so if we  apply
// pre hook , just before saving, it will do something - maybe hash the password