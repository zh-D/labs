const express = require('express');
const fileUpload = require('express-fileupload');
const fse = require('fs-extra')

const app = express();

app.use(fileUpload());

// Upload Endpoint
app.post('/upload', async (req, res) => {
    if (req.files === null) {
        return res.status(400).json({ msg: 'No file uploaded' });
    }



    const file = req.files.file;
    console.log(file.name);
    const exists = await fse.pathExists(`${__dirname}/client/public/uploads/${file.name}`)

    if (exists) {
        return res.status(400).json({ msg: 'file existed' });
    }


    file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }

        res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
    });
});

app.listen(5000, () => console.log('Server Started...'));