#!/bin/bash

API_URL="http://localhost:3000/api/v1"
CURRENT_MONTH=$(date +%Y-%m)

echo "🧪 Testing Bun Payments API"
echo "============================"

# Test 1: Health Check
echo -e "\n✅ Test 1: Health Check"
curl -s http://localhost:3000/health | jq .

# Test 2: Create Service
echo -e "\n✅ Test 2: Create Service"
SERVICE_RESPONSE=$(curl -s -X POST $API_URL/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Internet",
    "amount": 49.99,
    "dueDate": 10,
    "category": "Utilidades"
  }')
echo $SERVICE_RESPONSE | jq .
SERVICE_ID=$(echo $SERVICE_RESPONSE | jq '.data.id')

# Test 3: Create Another Service
echo -e "\n✅ Test 3: Create Another Service"
SERVICE_RESPONSE2=$(curl -s -X POST $API_URL/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix",
    "amount": 12.99,
    "dueDate": 5,
    "category": "Entretenimiento"
  }')
echo $SERVICE_RESPONSE2 | jq .

# Test 4: Get All Services
echo -e "\n✅ Test 4: Get All Services"
curl -s $API_URL/services | jq .

# Test 5: Get Service by ID
echo -e "\n✅ Test 5: Get Service by ID"
curl -s $API_URL/services/$SERVICE_ID | jq .

# Test 6: Update Service
echo -e "\n✅ Test 6: Update Service"
curl -s -X PUT $API_URL/services/$SERVICE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 59.99,
    "dueDate": 15
  }' | jq .

# Test 7: Create Monthly Payments
echo -e "\n✅ Test 7: Create Monthly Payments"
curl -s -X POST $API_URL/payments/monthly?month=$CURRENT_MONTH | jq .

# Test 8: Get Payments by Month
echo -e "\n✅ Test 8: Get Payments by Month"
PAYMENTS=$(curl -s "$API_URL/payments/month?month=$CURRENT_MONTH")
echo $PAYMENTS | jq .

# Test 9: Get Month Summary
echo -e "\n✅ Test 9: Get Month Summary"
curl -s "$API_URL/payments/summary/month?month=$CURRENT_MONTH" | jq .

# Test 10: Update Payment Status
echo -e "\n✅ Test 10: Update Payment Status"
PAYMENT_ID=$(echo $PAYMENTS | jq '.data[0].id')
curl -s -X PUT $API_URL/payments/$PAYMENT_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "paid",
    "paymentMethod": "Transferencia Bancaria"
  }' | jq .

# Test 11: Get Service Payment History
echo -e "\n✅ Test 11: Get Service Payment History"
curl -s $API_URL/payments/service/$SERVICE_ID | jq .

# Test 12: Get Updated Month Summary
echo -e "\n✅ Test 12: Get Updated Month Summary"
curl -s "$API_URL/payments/summary/month?month=$CURRENT_MONTH" | jq .

echo -e "\n✅ All tests completed!"
