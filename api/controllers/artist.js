'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getArtist(req, res) {
    var artistId = req.params.id;
    
    Artist.findById(artistId, (err, artist) => {
        if(err) {
            res.status(500).send({
                message: 'Error en la peticion'
            });            
        }else {
            if(!artist) {
                res.status(404).send({
                    message: 'El artista no existe'
                });                
            }else {
                res.status(200).send({
                    artist
                });                 
            }
        }
    });
}

function saveArtist(req, res) {
    var artist = new Artist();
    
    var params = req.body;
    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';
    
    artist.save((err, artistStored) => {
        if(err) {
            res.status(500).send({
                message: 'Error al guardar el artista'
            });            
        }else {
            if(artistStored) {
                res.status(200).send({
                    artist: artistStored
                });       
            }else {
                res.status(404).send({
                    message: 'El artista no se pudo guardar'
                });                   
            }
        }
    });
}

function getArtists(req, res) {
    var page = 1;
    var itemsPerPage = 3;

    if(req.params.page) {
        page = req.params.page;
    }
    
    Artist.find().sort('name').paginate(page, itemsPerPage, function(err, artists, total) {
        if(err) {
            res.status(500).send({
                message: 'Error en la peticion'
            });              
        }else {
            if(!artists) {
                res.status(404).send({
                    message: 'No hay artistas'
                });                 
            }else {
                return res.status(200).send({
                    total_items: total,
                    artists: artists
                });
            }
        }
    });
}

function updateArtist(req, res) {
    var artistId = req.params.id;
    var update = req.body;
    
    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
        if(err) {
            res.status(500).send({
                message: 'Error en la peticion'
            });             
        }else {
            if(!artistUpdated) {
                res.status(404).send({
                    message: 'El artista no ha sido actualizado'
                });                 
            }else {
                res.status(200).send({
                    artist: artistUpdated
                });                
            }
        }
    });
}

function deleteArtist(req, res) {
    var artistId = req.params.id;
    
    Artist.findByIdAndRemove(artistId, (err, artistRemoved) => {
        if(err) {
            res.status(500).send({
                message: 'Error en la peticion artista'
            });             
        }else {
            if(!artistRemoved) {
                res.status(404).send({
                    message: 'El artista no se ha eliminado'
                });                  
            }else {
                Album.find({artist: artistRemoved._id}).remove((err, albumRemoved) => {
                    if(err) {
                        res.status(500).send({
                            message: 'Error en la peticion album'
                        });                         
                    }else {
                        if(!albumRemoved) {
                            res.status(404).send({
                                message: 'El album no se ha eliminado'
                            });                               
                        }else {
                            Song.find({album: albumRemoved._id}).remove((err, songRemoved) => {
                                if(err) {
                                    res.status(500).send({
                                        message: 'Error en la peticion cancion'
                                    });                         
                                }else {
                                    if(!songRemoved) {
                                        res.status(404).send({
                                            message: 'La cancion no se ha eliminado'
                                        });                                          
                                    }else {
                                        res.status(200).send({
                                            artist: artistRemoved,
                                            album: albumRemoved,
                                            song: songRemoved
                                        });                                          
                                    }
                                }                               
                            });
                        }
                    }
                });
            }
        }
    });
}

function uploadImage(req, res) {
    var artistId = req.params.id;
    var file_name = 'No subido...';
    
    if(req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\/');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1].toLowerCase();
        
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif') {
            Artist.findByIdAndUpdate(artistId, {image: file_name}, (err, artistUpdated) => {
                if(err) {
                    res.status(500).send({
                        message: 'Error al actualizar el artista'
                    });           
                }else {
                    if(!artistUpdated) {
                        res.status(404).send({
                            message: 'No se pudo actualizar el artista'
                        });                    
                    }else {
                        res.status(200).send({
                            artist: artistUpdated
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
    var pathFile = './uploads/artists/'+imageFile;
    
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
    getArtist,
    saveArtist, 
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
};