import {
  useState
} from 'react'
import GeoLocation from './interface/GeoLocation'
import styles from '@/styles/Home.module.css'

export default function Home() {
  const [ipAddresses, setIpAddresses] = useState < string > ("");
  const [errorMessage, setErrorMessage] = useState < string > ("");
  const [geoLocations, setGeoLocations] = useState < GeoLocation[] > ([]);

  const handleInputChange = (event: React.ChangeEvent < HTMLInputElement > ) => {
    setIpAddresses(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent < HTMLFormElement > ) => {
    event.preventDefault();
    if (!validateIpAddresses(ipAddresses)) {
      setErrorMessage("Invalid IP address format");
      setGeoLocations([]);
      return;
    }
    const ips = ipAddresses.split(",").map((ip: string) => ip.trim());
    const response = await fetch(`/api/ipinfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "ipAddresses": ips
      }),
    });
    const data = await response.json();
    if (data.error || !data) {
      setErrorMessage(data.error);
      setGeoLocations([]);
      return;
    }
    setGeoLocations(data);
    setIpAddresses("");
    setErrorMessage("");
  };

  const handleClear = () => {
    setIpAddresses("");
    setErrorMessage("");
    setGeoLocations([]);
  };

  const validateIpAddresses = (ipAddresses: string) => {
    const regex = /^(\d{1,3}\.){3}\d{1,3}(,\s*(\d{1,3}\.){3}\d{1,3})*$/;
    return regex.test(ipAddresses);
  };
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <form onSubmit={handleSubmit}>
          <label htmlFor="ip-addresses">Enter IP addresses (comma-separated)</label>
          <input
            type="text"
            id="ip-addresses"
            name="ip-addresses"
            value={ipAddresses}
            onChange={handleInputChange}
          />
          <button type="submit">Submit</button>
          <button type="button" onClick={handleClear}>
            Clear
          </button>
        </form>
        {errorMessage && <p>{errorMessage}</p>}
        
        {geoLocations.length > 0 && (
          <table className={styles.tablebordered}>
            <thead>
              <tr>
                <th>IP Address</th>
                <th>Country Code</th>
                <th>Postal Code</th>
                <th>City Name</th>
                <th>Time Zone</th>
                <th>Accuracy Radius</th>
              </tr>
            </thead>
            <tbody>
              {geoLocations.map((geoLocation, index) => (
                <tr key={index}>
                  <td>{geoLocation.ipAddress}</td>
                  <td>{geoLocation.countryCode}</td>
                  <td>{geoLocation.postalCode}</td>
                  <td>{geoLocation.cityName}</td>
                  <td>{geoLocation.timeZone}</td>
                  <td>{geoLocation.accuracyRadius}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
