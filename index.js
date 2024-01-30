const express = require('express');
const { Deta } = require("deta");
const axios = require('axios');
require('babel-polyfill');
var brandedQRCode = require('branded-qr-code');

const app = express();
const deta = Deta('b0z61Ay7aZUy_EB8xyjVZ4BZMJvq7itEVKNHjWaPqK3jq');
const db = deta.Base('points2');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont(path.resolve(__dirname, 'montserrat.ttf'), { family: 'Montserrat'});
app.use(express.json());

// Endpoint to add data to the database

// Endpoint to store data in the database
app.post('/store-db-data', async (req, res) => {
    try {
        const key = Object.keys(req.body)[0];
        const data = req.body[key];
        
        if (typeof data !== 'object') {
            throw new Error('Invalid data format');
        }
        
        await db.put(data, key);
        console.log("Data stored in the database", data, key);
        res.status(200).json({ message: 'Data stored in the database' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to store data in the database' });
    }
});

// Endpoint to delete data from the database
app.post('/delete-db-data', async (req, res) => {
    try {
        if (!Array.isArray(req.body)) {
            throw new Error('Invalid data format');
        }
        
        console.log(req.body[0])
        await db.delete(req.body[0]);
        res.status(200).json({ message: 'Data deleted from the database' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete data from the database' });
    }
});

// Endpoint to get data from the database
app.post('/get-db-data', async (req, res) => {
    try {
        if (!Array.isArray(req.body)) {
            throw new Error('Invalid data format');
        }
        
        const data = req.body[0]
        
        const item = await db.get(data);
        res.status(200).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get data from the database' });
    }
});

// Endpoint to get leaderboard data from the database
app.get('/get-leaderboard', async (req, res) => {
    try {
        let allData = await db.fetch();
        let leaderboardData = allData.items.filter(item => item.points !== undefined);
        leaderboardData.sort((a, b) => b.points - a.points);
        leaderboardData = leaderboardData.slice(0, 10);
        res.status(200).json(leaderboardData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get leaderboard data from the database' });
    }
});
//takes about 90 seconds for 50 pics
app.post('/create-qr', async (req, res) => {
    console.log(req.body)
 
 
    try {
      const strings = req.body;
  
      if (!Array.isArray(strings)) {
        res.status(400).json({ error: 'Invalid data format' });
      }
  
      for (let i = 0; i < strings.length; i++) {
        const str = strings[i];
  
        const buf = await brandedQRCode.generate({
          text: str,
          path: __dirname + '/splash.png',
          ratio: 1.6,
          opt: { errorCorrectionLevel:  'H', margin: 2, width: 1600},
        });
  
        const image = await loadImage(buf);
  
        const canvas = createCanvas(image.width, image.height + 200);
        const context = canvas.getContext('2d');
  
        context.drawImage(image, 0, 0, image.width, image.height);
  
        context.fillStyle = 'black';
        context.fillRect(0, image.height, canvas.width, 200);
  
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = '90px "Arial"';
        context.fillText(str, canvas.width / 2, image.height + 130);
  
        const out = fs.createWriteStream(path.resolve(__dirname, `./output/${str}.png`));
        const stream = canvas.createPNGStream();
        stream.pipe(out);
      }
  
      res.status(200).json({ message: 'QR codes created' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create QR codes' });
    }
    
  });
//get image from current directory

// Endpoint to get data from the database

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

[
    
]