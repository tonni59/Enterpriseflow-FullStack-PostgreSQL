# Thunder Client request checklist

Set `baseUrl = http://localhost:5000/api`.

1. Health — GET `{{baseUrl}}/health`
2. Register — POST `{{baseUrl}}/auth/register`
   ```json
   {"name":"Test User","email":"test@example.com","password":"TestPass123"}
   ```
3. Login — POST `{{baseUrl}}/auth/login`
   ```json
   {"email":"admin@enterpriseflow.dev","password":"Admin123!"}
   ```
4. Copy token from response. For protected calls add `Authorization: Bearer <token>`.
5. Categories — GET `{{baseUrl}}/categories`
6. Products — GET `{{baseUrl}}/products`
7. Create product — POST `{{baseUrl}}/products` (admin token)
   ```json
   {"name":"Test Mouse","description":"Ergonomic mouse","price":24.99,"stock":15,"imageUrl":"","categoryId":"CATEGORY_ID"}
   ```
8. Cart — POST `{{baseUrl}}/cart` (customer token)
   ```json
   {"productId":"PRODUCT_ID","quantity":1}
   ```
9. Create order — POST `{{baseUrl}}/orders` (customer token)
   ```json
   {"shippingAddress":"Road 1, Dhaka, Bangladesh"}
   ```
10. Admin stats — GET `{{baseUrl}}/admin/stats` (admin token)
