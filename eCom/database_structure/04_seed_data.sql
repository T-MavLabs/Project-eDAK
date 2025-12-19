-- =========================================================
-- SEED DATA FOR INDIAN E-COMMERCE DEMO
-- =========================================================
-- This data is ONLY for demo & hackathon purposes
-- Represents MSME / small Indian sellers using India Post
-- =========================================================

-- -----------------------------
-- PRODUCTS
-- -----------------------------
INSERT INTO products (
  id,
  name,
  description,
  price,
  category,
  image_path,
  seller_name,
  is_active
) VALUES
(
  gen_random_uuid(),
  'Handmade Brass Diya',
  'Traditional handmade brass diya crafted by rural artisans from Maharashtra.',
  499,
  'Handicrafts',
  null,
  'Shakti Handicrafts',
  true
),
(
  gen_random_uuid(),
  'Khadi Cotton Kurta',
  'Authentic hand-spun Khadi cotton kurta, breathable and eco-friendly.',
  1299,
  'Clothing',
  null,
  'Gram Udyog Store',
  true
),
(
  gen_random_uuid(),
  'Indian Postal History Book',
  'A detailed book on the evolution of Indian postal services.',
  799,
  'Books',
  null,
  'Bharat Publications',
  true
),
(
  gen_random_uuid(),
  'Eco-friendly Jute Bag',
  'Reusable jute shopping bag made by SHG women entrepreneurs.',
  349,
  'Lifestyle',
  null,
  'GreenRoots Collective',
  true
),
(
  gen_random_uuid(),
  'Copper Water Bottle',
  'Ayurvedic copper water bottle for daily health benefits.',
  899,
  'Health',
  null,
  'AyurSwasth',
  true
);

-- -----------------------------
-- SAMPLE ORDERS (OPTIONAL DEMO)
-- -----------------------------
INSERT INTO orders (
  id,
  user_email,
  total_amount,
  digipin,
  tracking_id,
  status
) VALUES
(
  gen_random_uuid(),
  'demo.user@gmail.com',
  1299,
  '39-72-8F',
  'IP-DEMO-1001',
  'shipped'
);

-- -----------------------------
-- SAMPLE ORDER ITEMS
-- -----------------------------
INSERT INTO order_items (
  order_id,
  product_id,
  quantity,
  price_at_purchase
)
SELECT
  o.id,
  p.id,
  1,
  p.price
FROM orders o
JOIN products p
ON p.name = 'Khadi Cotton Kurta'
WHERE o.tracking_id = 'IP-DEMO-1001';
