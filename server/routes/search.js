const express = require('express');
const router = express.Router();

router.post('/api/search', (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  // Mock product data
  const products = [
    {
      name: "Levi's Slim Fit Summer Jeans",
      price: "$79.99",
      image: "https://via.placeholder.com/150",
      pickup: "Available at Ross Park Mall"
    },
    {
      name: "Gap Breathable Denim",
      price: "$69.99",
      image: "https://via.placeholder.com/150",
      pickup: "Available at Ross Park Mall"
    }
  ];

  res.json(products);
});

module.exports = router; 