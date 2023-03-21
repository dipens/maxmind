import GeoIpApp from '../../src/index'
import request from 'supertest';
import { Reader } from '@maxmind/geoip2-node';

describe('GeoIpApp', () => {
  let geoIpApp: GeoIpApp;
  let app: GeoIpApp['app'];

  beforeAll(() => {
    geoIpApp = new GeoIpApp(4000)
    app = geoIpApp.app;
  });

  afterAll(() => {
    geoIpApp.close();
  });

  describe('POST /ipinfo', () => {
    it('should return 400 if ipAddresses is missing', async () => {
      const response = await request(app).post('/ipinfo').send({});
      expect(response.status).toBe(400);
      expect(response.text).toBe('Bad Request');
    });

    it('should return 400 if ipAddresses is not an array', async () => {
      const response = await request(app)
        .post('/ipinfo')
        .send({ ipAddresses: 'invalid' });
      expect(response.status).toBe(400);
      expect(response.text).toBe('Bad Request');
    });

    it('should return 400 if ipAddresses is an empty array', async () => {
      const response = await request(app).post('/ipinfo').send({ ipAddresses: [] });
      expect(response.status).toBe(400);
      expect(response.text).toBe('Bad Request');
    });

    it('should return 400 if one or more ip addresses are invalid', async () => {
      const response = await request(app)
        .post('/ipinfo')
        .send({ ipAddresses: ['invalid', '127.0.0.1'] });
      expect(response.status).toBe(400);
      expect(response.text).toBe('One or more ip addresses are invalid');
    });

    it('should return the correct response for a valid request', async () => {
      const response = await request(app)
        .post('/ipinfo')
        .send({ ipAddresses: ['8.8.8.8', '9.9.9.9'] });
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          ipAddress: '8.8.8.8',
          countryCode: 'US',
          postalCode: '90009',
          cityName: 'Los Angeles',
          timeZone: 'America/Los_Angeles',
          accuracyRadius: 1000,
        },
        {
          ipAddress: '9.9.9.9',
          countryCode: 'US',
          postalCode: '94709',
          cityName: 'Berkeley',
          timeZone: 'America/Los_Angeles',
          accuracyRadius: 20,
        },
      ]);
    });

    it('should return 500 if an error occurs', async () => {
      const originalReaderOpen = Reader.open;
      Reader.open = jest.fn(() => {
        throw new Error('Test Error');
      });

      const response = await request(app)
        .post('/ipinfo')
        .send({ ipAddresses: ['8.8.8.8', '1.1.1.1'] });
      expect(response.status).toBe(500);
      expect(response.text).toBe('Internal Server Error');

      Reader.open = originalReaderOpen;
    });
  });
});
