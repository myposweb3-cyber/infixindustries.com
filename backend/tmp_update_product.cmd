@echo off
set TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzg1Njc1NTE2LCJleHAiOjE3ODYyODAzMTZ9.vtAnUIlh7-juA8ZfbChlAHMZGpyHuaOnfaAbThk7u2E
curl.exe -i -X PUT -H "Authorization: Bearer %TOKEN%" -F "title=Test Save" -F "slug=test-save" -F "description=Testing admin update route" -F "price=19.99" -F "stock=5" -F "category=24" -F "brand=" -F "is_featured=true" -F "is_best_seller=false" http://localhost:4000/api/products/92
