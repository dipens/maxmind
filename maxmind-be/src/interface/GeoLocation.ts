interface GeoLocation {
    ipAddress: string;
    countryCode: string;
    postalCode: string;
    cityName: string;
    timeZone: string;
    accuracyRadius: number | string;
}

export default GeoLocation;