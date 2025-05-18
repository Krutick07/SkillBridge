const User = require('../Modals/userModals');
const bcrypts = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, email, password, role} = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User Already exists.' });

        const salt = await bcrypts.genSalt(10);
        const hashedPassword = await bcrypts.hash(password, salt);

        const newUser = await User.create({ name, email, password: hashedPassword,role: role || 'user' });
        res.status(201).json({ _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypts.compare(password, existingUser.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            token,
            user: {
                _id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllUser = async (req,res) =>{
    try{
        const users = await User.find().select('-password');
        res.status(200).json(users);
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

exports.updateUserRole = async (req,res) =>{
    const {userId, role} = req.body;
    if(!['user','admin'].includes(role)){
        return res.status(400).json({message: 'Invaild role'});
    }

    try{
        const user = await User.findByIdAndUpdate(userId,{role},{new: true}).select('-password');
        if(!user) return res.status(404).json({message: 'User not found'});
        
        res.status(200).json({message: 'Role Updated', user});
    }catch(error){
        res.status(500).json({message: error.message});
    }

}
