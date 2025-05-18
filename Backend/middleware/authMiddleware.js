const jwt = require('jsonwebtoken');
const User = require('../Modals/userModals');

exports.protect = async (req,res,next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try{
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET.replace(/['"]+/g, ''));

            req.user = await User.findById(decoded.id).select('-password');

            if(!req.user){
                return res.status(401).json({message: 'User not found'});
            }

            next();
        } catch(error){
            console.log('Auth Error:', error.message);
            return res.status(401).json({message: 'token invalid'});
        }
    }else{
        return res.status(401).json({message: 'No token provided'});
    }
}

exports.adminOnly = (req,res,next) => {
    if(req.user && req.user.role === 'admin'){
        next();
    }else{
        return res.status(403).json({message: 'Admin access only'});
    }
}