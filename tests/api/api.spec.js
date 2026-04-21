import { test, expect } from '@playwright/test';

const API_BASE = '/api';

test.describe('Public API Endpoints', () => {
  test('health endpoint responds', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    expect(response.ok()).toBeTruthy();
  });

  test('public teams endpoint returns data', async ({ request }) => {
    const response = await request.get(`${API_BASE}/teams`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data.teams)).toBeTruthy();
  });

  test('public members endpoint returns data', async ({ request }) => {
    const response = await request.get(`${API_BASE}/members`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data.members)).toBeTruthy();
  });

  test('public publications endpoint returns data', async ({ request }) => {
    const response = await request.get(`${API_BASE}/publications`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data.publications)).toBeTruthy();
  });

  test('publications search works', async ({ request }) => {
    const response = await request.get(`${API_BASE}/publications?search=machine`);
    expect(response.ok()).toBeTruthy();
  });

  test('phd-progress endpoint returns data', async ({ request }) => {
    const response = await request.get(`${API_BASE}/phd-progress`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data.progress)).toBeTruthy();
  });

  test('citation export API works', async ({ request }) => {
    const pubResponse = await request.get(`${API_BASE}/publications`);
    const publications = await pubResponse.json();
    
    if (publications.publications?.length > 0) {
      const pubId = publications.publications[0]._id;
      const bibtexResponse = await request.get(`${API_BASE}/publications/${pubId}/citation?format=bibtex`);
      expect(bibtexResponse.ok()).toBeTruthy();
      
      const apaResponse = await request.get(`${API_BASE}/publications/${pubId}/citation?format=apa`);
      expect(apaResponse.ok()).toBeTruthy();
    }
  });
});

test.describe('Admin API Auth', () => {
  test('login with valid credentials succeeds', async ({ request }) => {
    const response = await request.post(`${API_BASE}/admin/auth/login`, {
      data: {
        email: 'admin@blida-research.example.org',
        password: 'admin123',
      },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('admin@blida-research.example.org');
  });

  test('login with invalid credentials fails', async ({ request }) => {
    const response = await request.post(`${API_BASE}/admin/auth/login`, {
      data: {
        email: 'admin@blida-research.example.org',
        password: 'wrongpassword',
      },
    });
    expect(response.status()).toBe(401);
  });
});