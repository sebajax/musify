'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');

function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando una accion del controlador de usuarios del api rest con Node y mongo'
    });
}

function saveUser(req, res) {
    var user = new User();
    var params = req.body;
    
    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_USER';
    user.image = 'null';
    
    if(params.password) {
        // encriptar la contraseña
        bcrypt.hash(params.password, null, null, function(err, hash) {
            user.password = hash;
            if(user.name != null && user.surname != null && user.email != null && !err) {
                // guardar usuario en bd
                user.save((err, userStored) => {
                    if(err) {
                        res.status(500).send({
                            message: 'Error al guardar el usuario'
                        });                          
                    }else {
                        if(!userStored) {
                            res.status(404).send({
                                message: 'No se pudo registrar el usuario'
                            });                              
                        }else {
                            res.status(200).send({
                                user: userStored
                            });                               
                        }
                    }
                });
            }else {
                res.status(200).send({
                    message: 'Introduce todos los campos'
                });                
            }            
        });
        
    }else {
        res.status(200).send({
            message: 'Debe enviar password'
        });
    }     
}

function loginUser(req, res) {
    var params = req.body;
    
    var email = params.email;
    var password = params.password;
    
    User.findOne({email: email.toLowerCase()}, (err, user) => {
        if(err) {
            res.status(500).send({
                message: 'Error en la peticion'
            });
        }else {
            if(!user) {
                res.status(404).send({
                    message: 'El usuario no existe'
                });
            }else {
                bcrypt.compare(password, user.password, (err, check) => {
                    if(check) {
                        if(params.gethash) {
                            //devolver un token jwt
                            res.status(200).send({
                               token: jwt.createToken(user)
                            });
                        }else {
                            res.status(200).send({
                               user 
                            });
                        }
                    }else {
                        res.status(400).send({
                            message: 'El usuario no se pudo loguear'
                        });
                    }
                });
            }
        }
    });
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;
    
    if(userId != req.user.sub) {
        return res.status(500).send({
            message: 'No tienes permisos para actualizar este usuario'
        });         
    }
    
    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
        if(err) {
            res.status(500).send({
                message: 'Error al actualizar el usuario'
            });           
        }else {
            if(!userUpdated) {
                res.status(404).send({
                    message: 'No se pudo actualizar el usuario'
                });                    
            }else {
                res.status(200).send({
                    user: userUpdated
                });                
            }
        }
    });
}

function uploadImage(req, res) {
    var userId = req.params.id;
    var file_name = 'No subido...';
    
    if(req.files) {
        var file_path = req.files.image.path;
        
        var file_split = file_path.split('\/');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1].toLowerCase();
        
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif') {
            User.findByIdAndUpdate(userId, {image: file_name}, (err, userUpdated) => {
                if(err) {
                    res.status(500).send({
                        message: 'Error al actualizar el usuario'
                    });           
                }else {
                    if(!userUpdated) {
                        res.status(404).send({
                            message: 'No se pudo actualizar el usuario'
                        });                    
                    }else {
                        res.status(200).send({
                            image: file_name,
                            user: userUpdated
                        });                
                    }
                }
            });
        }else {
            res.status(200).send({
                message: 'Extesion del archivo no es correcta'
            });              
        }
    }else {
        res.status(200).send({
            message: 'No ha subido ninguna imagen'
        });  
    }
}

function getImageFile(req, res) {
    var imageFile = req.params.imageFile;
    var pathFile = './uploads/users/'+imageFile;
    
    fs.exists(pathFile, function(exists){
        if(exists) {
            res.sendFile(path.resolve(pathFile));
        }else {
            res.status(200).send({
                message: 'La imagen no existe'
            });            
        }
    });
}

module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
};