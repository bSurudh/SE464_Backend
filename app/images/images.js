var express   = require('express');
var mongodb   = require('mongodb');
var ObjectID  = mongodb.ObjectID;

const IMAGE_COLLECTION = 'images';

module.exports = function(app, db) {
	var paramM = require("../shared/params.middleware.js")(app, db);
	var authM  = require("../shared/auth.middleware.js")(app, db);

	function getImagesInRange(req, res) {
		db.collection(IMAGE_COLLECTION)
			.find()
			.toArray()
			.then(function(images) {
				res.status(200).json(images).end();
			}).catch(function(err) {
				res.status(500).json({error: "Failed to get images"}).end();
			});
	}

	function postImage(req, res) {
		var image = {};

		image.name        = req.body.name        || 'Untitled';
		image.description = req.body.description || 'No Description :)';
		image.rating      = 5;
		image.user        = req.user;
		image.filePath    = '../../images/dummy';

		db.collection(IMAGE_COLLECTION)
			.insert(image)
			.then(function(image) {
				res.status(200).json(image).end();
			}).catch(function(err) {
				res.status(500).json({error: "Failed to post image"}).end();
			});
	}

	function getImage(req, res) {
		db.collection(IMAGE_COLLECTION)
			.findOne({_id: new ObjectID(req.params.id)})
			.then(function(image) {
				res.status(200).json(image).end();
			}).catch(function(err) {
				res.status(500).json({error: "Failed to get image"}).end();
			});
	}

	function updateImage(req, res) {
		var update = {};

		update.name        = req.body.name;
		update.description = req.body.description;

		//req.user = new ObjectID('582f4be12761ce23c5f7109d');

		db.collection(IMAGE_COLLECTION)
			.updateOne({_id: new ObjectID(req.params.id), user: req.user}, {$set: update})
			.then(function(image) {
				if (image.result.n === 0) {
					res.status(401).json({error: "Unauthorized"}).end();
				} else {
					res.status(200).json(image).end();
				}
			}).catch(function(err) {
				res.status(500).json({error: "Failed to update image"}).end();
			});
	}

	function deleteImage(req, res) {
		db.collection(IMAGE_COLLECTION)
			.deleteOne({_id: new ObjectID(req.params.id)})
			.then(function(image) {
				if (image.result.nModified === 0) {
					res.status(401).json({error: "Unauthorized"}).end();
				} else {
					res.status(200).end();
				}
			}).catch(function(err) {
				res.status(500).json({error: "Failed to delete image"}).end();
			});
	}

	app.get('/images', getImagesInRange);
	app.post('/images', authM.validateUser,
						paramM.checkBodyParams(['longitude', 'latitude']),
						postImage);

	app.get('/images/:id', getImage);
	app.put('/images/:id',	authM.validateUser,
							updateImage);
	app.delete('/images/:id',	authM.validateUser,
								deleteImage);
}