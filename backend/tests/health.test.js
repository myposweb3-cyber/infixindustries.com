const request = require('supertest');
const express = require('express');

describe('health endpoint', ()=>{
  let app;
  beforeAll(()=>{
    app = express();
    app.get('/health', (req,res)=>res.json({status:'ok'}));
  });

  test('GET /health returns ok', async ()=>{
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({status:'ok'});
  });
});
