const express = require('express');
const user = require('../models/user');
const router = express.Router();
const sharp = require('sharp');
const uploader = require('../utils/multer');
const cloudinary = require('../utils/cloudinary');
const jwt = require('jsonwebtoken'); // Don't forget to import jwt for token verification




router.post('/setpin', async (req, res) => {
    const { token, pin } = req.body

    try {
        // check if the pin was sent
        if (!pin) {
            return res.status(400).send({ message: 'Please fill all the required fields' });
        }
        // verify for the user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by id and delete
        const eUser = await user.findById(decoded._id);
        if (!eUser) {
            return res.status(404).send('User not found');
        }


        eUser.pin = pin

        // save the pin in user
        await eUser.save()
        res.status(201).send({ message: 'Pin Saves Successfully.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error' });
    }

})

// Upload and compress profile image, store in Cloudinary, and save URL to user model
router.post('/upload-profile-pic', uploader.single('image'), async (req, res) => {
    const { token } = req.body;

    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).send({ status: 'error', msg: 'No file uploaded' });
        }

        // Compress the image using Sharp
        const compressedImage = await sharp(req.file.path)
            .resize({ width: 800 })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        // Upload the compressed image buffer to Cloudinary
        cloudinary.uploader.upload_stream({ folder: 'profile-images' }, async (error, result) => {
            if (error) {
                console.error('Upload to Cloudinary failed:', error);
                return res.status(500).send('Error uploading image to Cloudinary');
            }

            // Retrieve the authenticated user
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const eUser = await user.findById(decoded._id);

            if (!eUser) {
                return res.status(404).send('User not found');
            }

            // Save Cloudinary URL and public_id to the user model
            eUser.image = result.secure_url;
            eUser.image_id = result.public_id;  // Store the public_id

            // Save the updated user information
            await eUser.save();

            // Respond with success message
            res.status(200).send({
                success: 'Image uploaded, compressed, and saved successfully',
                imageUrl: result.secure_url
            });
        }).end(compressedImage);

    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).send('Error processing image: ' + error.message);
    }
});

// Delete profile picture from Cloudinary and remove URL from user model
router.delete('/delete-profile-pic', async (req, res) => {
    const { token } = req.body;

    try {
        // Verify token and find the user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const eUser = await user.findById(decoded._id);

        if (!eUser) {
            return res.status(404).send('User not found');
        }

        // Check if the user has an image to delete
        if (!eUser.image_id) {
            return res.status(400).send({ message: 'No profile picture to delete' });
        }

        // Delete the image from Cloudinary using the public_id
        await cloudinary.uploader.destroy(eUser.image_id, async (error, result) => {
            if (error) {
                console.error('Failed to delete image from Cloudinary:', error);
                return res.status(500).send('Failed to delete image from Cloudinary');
            }

            // Remove the image URL and public_id from the user document
            eUser.image = null;
            eUser.image_id = null;
            await eUser.save();

            res.status(200).send({ message: 'Profile picture deleted successfully' });
        });

    } catch (error) {
        console.error('Error deleting profile picture:', error);
        res.status(500).send({ message: 'Error deleting profile picture: ' + error.message });
    }
});

module.exports = router;
