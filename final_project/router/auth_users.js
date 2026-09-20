const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return false if any user with the same username is found, otherwise true
  if (userswithsamename.length > 0) {
    return false;
  } else {
    return true;
  }
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        username: username,
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 },
    );

    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
  // return res.status(300).json({ message: "Yet to be implemented" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.user.username;
  const bookreviews = books[isbn].reviews;
  for (const i in bookreviews) {
    if (i == username) {
      bookreviews[i].review = review;
      return res.send("Review updated");
    }
  }
  books[isbn].reviews = { ...bookreviews, [username]: { review: review } };
  return res.send("Review updated");
  //return res.status(300).json({ message: "Yet to be implemented" });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;
  if (isbn) {
    // Delete book from 'books' object based on provided isbn
    delete books[isbn].reviews[username];
    res.send("Review deleted")
  } else {
    res.send(`${isbn} not found`);
  }

  // Send response confirming deletion of isbn
  res.send(`Book with the isbn ${isbn} deleted.`);
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
