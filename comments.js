// Create web server
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');

app.use(bodyParser.json());

// Get comments
app.get('/comments', (req, res) => {
  fs.readFile('comments.json', (err, data) => {
    if (err) {
      res.status(500).send('Error reading comments.json');
    } else {
      res.send(JSON.parse(data));
    }
  });
});

// Post comment
app.post('/comments', (req, res) => {
  if (!req.body.comment) {
    res.status(400).send('Comment is required');
    return;
  }

  fs.readFile('comments.json', (err, data) => {
    if (err) {
      res.status(500).send('Error reading comments.json');
    } else {
      let comments = JSON.parse(data);
      comments.push(req.body.comment);

      fs.writeFile('comments.json', JSON.stringify(comments), (err) => {
        if (err) {
          res.status(500).send('Error writing comments.json');
        } else {
          res.status(201).send('Comment added');
        }
      });
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

// Path: comments.test.js
// Test comments.js
const request = require('supertest');
const fs = require('fs');

const app = require('./comments');

describe('GET /comments', () => {
  it('should return comments', (done) => {
    request(app)
      .get('/comments')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body).toEqual([]);
        done();
      });
  });
});

describe('POST /comments', () => {
  beforeAll(() => {
    fs.writeFileSync('comments.json', '[]');
  });

  it('should return 400 if comment is not provided', (done) => {
    request(app)
      .post('/comments')
      .expect(400, done);
  });

  it('should return 201 if comment is provided', (done) => {
    request(app)
      .post('/comments')
      .send({ comment: 'Hello' })
      .expect