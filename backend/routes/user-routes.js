const mongoose = require('mongoose');
var user = require('../modals/user');
var jwt = require('jsonwebtoken');
var config = require('../config/config');
const { json } = require('express');

exports.signup = ((req, res, next)=> {
    const userData =  req.body;
    const firstname = userData.firstname;
    const lastname = userData.lastname;
    const email = userData.email;
    const username = userData.username;
    const password = userData.password;
    if(!(firstname || lastname || email || username || password)){
        return res.status(422).json({
            success: false, 
            message:'Posted data is not correct or incomplete'
        });

    }

    user.findOne({username: username}, (err, existingUser)=> {
        if(err) {
            res.status(400).json({
                success: false,
                message: 'Error proccessing request'+ err
            });

        }
        //// If user is not unique return error
        if(existingUser){
            return res.status(201).json({
                success: false,
                message: 'Username already exist '
            })
        }
    });
    //// if no error, create account
    let oUser = new User({
        firstname: firstname,
        lastname: lastname,
        email: email,
        username: username,
        password: password
    });
    oUser.save((err, oUser)=> {
        if(err) {
            res.status(400).json({
                success: false,
                message: 'Error in processing request'+ err
            });

        }
        res.status(201).json({
            success: true,
            message: 'User Created successfully, please login to access your account'
        });
    });
});


exports.login = ((req, res, next)=> {
    User.findOne({username: req.body.username}, (err, user)=> {
        if(err) {
            res.status(400).json({
                success: false,
                message: 'Error in processing request'+ err
            });

        }
        if(!user){
            res.status(400).json({
                success: false,
                message: 'Incorrect Credentials'
            });
        }
        else if(user){
            user.comparePassword(req.body.password, (err, isMatch)=> {
                if(isMatch && !err){
                    var token = jwt.sign(user, config.secrete, {
                        expiresIn: config.tokenexp
                    });
                    /// login success update last login
                    user.lastlogin = new Date();

                    user.save((err)=> {
                        if(err){
                            res.status(400).json({
                                success: false,
                                message: 'Error in processing request'+ err
                            });
                        }
                        res.status(201).json({
                            success: true,
                            message: {
                                'userid': user._id,
                                'username':user.username,
                                'firstname': user.firstname,
                                'lastlogin': user.lastlogin
                                
                            },
                            token: token
                        });
                    });
                } else {
                    res.status(201).json({
                        success: false,
                        message: 'Incorrect Credentials...!!!'
                    });
                }
            })
        }
    })
})

exports.authenticate = ((req, res, next)=> {
    //// check header or url parameters pr post parameter for token
    var token = req.body.token || req.query.token || req.headers['authorization'];
    console.log(token);

    if(token){
        jwt.verify(token, config.secrete, (err, decoded)=> {
            if(err){
                res.status(201).json({
                    success: false,
                    message: 'Authentication token expired, please login again',
                    errcode: 'exp-token'
                });
            }else {
                req.decoded = decoded;
                next();
            }
        })
    } else {
        res.status(201).json({
            success: false,
            message: 'Fata eror, Authenticate token not available...!!!',
            errcode: 'no-token'
        });
    }
});

exports.getUserDetails = ((req, res, next)=> {
    user.find({_id:req.params.id}).exec((err, user)=> {
        if(err){
            res.status(400).json({
                success: false,
                message: 'Eror Processing Request'+ err,
                
            });
        }
        res.status(201).json({
            success: true,
            data: user
        });
    })
})


exports.updateUser = ((req, res, next)=> {
    const userData = req.body;
    const firstname = userData.firstname;
    const lastname = userData.lastname;
    const email = userData.email;
    const userid = req.params.id;
    if(!(firstname || lastname || email || userid)){
        res.status(422).json({
            success: false,
            message: 'Posted data is not correct or incomplete',
            
        });
    } else {
        user.findById(userid).exec((err, user)=> {
            if(err){
                res.status(400).json({
                    success: false,
                    message: 'Error processing request'+err,
                    
                });
            }
            if(user){
                user.firstname = firstname;
                user.lastname = lastname;
                uers.email = email;
            }
            user.save((err)=> {
                if(err){
                    res.status(400).json({
                        success: false,
                        message: 'Error processing request'+err,
                        
                    });
                }
                res.status(201).json({
                    success: true,
                    message: 'User details updated successfully',
                    
                });
            })
        })
    }
})


exports.updatePassword = ((req, res, next)=> {
    const userid = req.params.id;
    const oldpassword = req.body.oldpassword;
    const password = req.body.password;

    if(!(oldpassword || password || userid)){
        res.status(422).json({
            success: false,
            message: 'Posted data is incorrect or incomplete',
            
        });
    } else {
        user.findOne({_id:userid}, (err, user)=> {
            if(err){
                res.status(400).json({
                    success: false,
                    message: 'Error processing request'+err,
                    
                });
            }

            if(user){
                user.comparePassword(oldpassword, (err, isMatch)=> {
                    if(isMatch && !err){

                        user.password = password;

                        user.save((err)=> {
                            if(err){
                                res.status(400).json({
                                    success: false,
                                    message: 'Error processing request'+err,
                                    
                                });
                            }
                            res.status(201).json({
                                success:true,
                                message: 'Password Updated Successfully'
                            });
                        });

                    } else {
                        res.status(201).json({
                            success: false,
                            message: 'incorrect old password',
                            
                        });
                    }
                })
            }
        })
    }
})


























