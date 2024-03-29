import express from 'express';
import User from '../models/userModel';
import { getToken, isAuth, isAdmin, isSuperAdmin } from '../util';

const router = express.Router();

router.put('/:id', isAuth, async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;
    const updatedUser = await user.save();
    res.send({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isSuperAdmin: updatedUser.isSuperAdmin,
      token: getToken(updatedUser)
    });
  } else {
    res.status(404).send({ msg: 'User Not Found' });
  }

});

router.post('/signin', async (req, res) => {
  const signinUser = await User.findOne({
    email: req.body.email,
    password: req.body.password
  });
  if (signinUser) {
    res.send({
      _id: signinUser.id,
      name: signinUser.name,
      email: signinUser.email,
      isAdmin: signinUser.isAdmin,
      isSuperAdmin: signinUser.isSuperAdmin,
      token: getToken(signinUser)
    });
  } else {
    res.status(401).send({ msg: 'Invalid Email or Password.' });
  }
});

router.post('/register', async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });
  const newUser = await user.save();
  if (newUser) {
    res.send({
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      isSuperAdmin: newUser.isSuperAdmin,
      token: getToken(newUser)
    })
  } else {
    res.status(401).send({ msg: 'Invalid User Data.' });
  }
})

router.post("/addadmin",isAuth, isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const user = new User({
      name: 'admin('+req.body.name+')',
      email: req.body.email,
      password: req.body.password,
      isAdmin: true
    });
    const newUser = await user.save();
    res.send(newUser);
  } catch (error) {
    res.send({ msg: error.message });
  }
});

router.get("/alladmins", isAuth, isAdmin, isSuperAdmin, async (req, res) => {
 
  const admins = await User.find({
    isAdmin : true,
    isSuperAdmin : false 
  });
  res.send(admins);
});

router.get("/allusers", isAuth, isAdmin, isSuperAdmin, async (req, res) => {
 
  const users = await User.find({
    isAdmin : false,
    isSuperAdmin : false 
  });
  res.send(users);
});

router.delete("/:id", isAuth, isAdmin, isSuperAdmin, async (req, res) => {
  const deletedUser = await User.findById(req.params.id);
  if (deletedUser) {
    await deletedUser.remove();
    res.send({ message: "User Deleted" });
  } else {
    res.send("Error in Deletion.");
  }
});

router.get("/createadmin", async (req, res) => {
  try {
    const user = new User({
      name: 'Super Admin',
      email: 'superadmin@gmail.com',
      password: 'superadmin',
      isAdmin: true,
      isSuperAdmin: true
    });
    const newUser = await user.save();
    res.send(newUser);
  } catch (error) {
    res.send({ msg: error.message });
  }
});

export default router;