import express, { Request, Response } from 'express';
import { City, Reader } from '@maxmind/geoip2-node';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import GeoLocation from './interface/GeoLocation';

class GeoIpApp {
  public app: express.Application;
  private server: any;

  constructor(port: number = Number(process.env.PORT) || 3006) {
    dotenv.config();
    this.app = express();
    this.app.use(bodyParser.json());
    // ideally we only want to allow requests from our frontend, but for the sake of simplicity we allow all requests
    this.app.use(cors());
    this.app.post('/ipinfo', this.handleIpInfoRequest.bind(this));
    this.server = this.app.listen(port, () => {});
  }

  private async handleIpInfoRequest(req: Request, res: Response) {
    const ipAddresses: string[] = req.body.ipAddresses;
    if (!ipAddresses || !Array.isArray(ipAddresses) || ipAddresses.length === 0) {
      res.status(400).send('Bad Request');
      return;
    }

    // check if each ip address is valid
    const isValidIpAddresses = ipAddresses.every((ipAddress) => {
      const regex = new RegExp(
        /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
      );
      return regex.test(ipAddress);
    });

    if (!isValidIpAddresses) {
      res.status(400).send('One or more ip addresses are invalid');
      return;
    }


    try {
      const reader = await Reader.open(process.env.GEOLITE2_DB_PATH || '');

      const responses: City[] = await Promise.all(
        ipAddresses.map(async (ipAddress) => {
          const response = await reader.city(ipAddress);
          return response;
        })
      );
      const results: GeoLocation[] = responses.map((response, index) => {
        const countryCode = response.country?.isoCode || 'Unknown';
        const postalCode = response.postal?.code || 'Unknown';
        const cityName = response.city?.names?.en || 'Unknown';
        const timeZone = response.location?.timeZone || 'Unknown';
        const accuracyRadius = response.location?.accuracyRadius || 0;

        return {
          ipAddress: ipAddresses[index],
          countryCode,
          postalCode,
          cityName,
          timeZone,
          accuracyRadius,
        };
      });

      res.send(results);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }

  
  public close() {
    this.server.close();
  }
}

const app = new GeoIpApp();
export default GeoIpApp;