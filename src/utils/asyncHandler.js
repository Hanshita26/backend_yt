// WAY2 - GENERALLY USED - IN THE FORM OF PROMISES


// Promise.resolve().catch()

const asyncHandler=(fn)=>{
    return (req,res,next)=>{
        Promise.resolve(fn(req,res,next)).catch((err)=>next(err))
    }
}
// const asyncHandler=(fn)=>(req,res,next)=>{
//     Promise.resolve(fn(req,res,next)).catch(next);
    
// }

export {asyncHandler}

// const asyncHandler=(requestHandler)=>{
//     return (req,res,next)=>{
//         Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err));
//     }

// }


// way1 - using TRY CATCH
// const asyncHandler=(fn)=>async (req,res,next)=>{ // higher order function
//      try{
//         await fn(req,res,next)

//      }catch(err){
//         res.status(err.code() || 500).josn({
//             success:false,
//             message: err.message
//         })
//      }



// }

// function ko function mai pass kardiya - higher order function
