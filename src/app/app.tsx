import * as React from 'react';
import * as ReactDOM from 'react-dom';
import fetchJsonp = require("fetch-jsonp");

interface Location {
    name: string;
    postalCode: string;
}

interface WeatherInfo {
    base: string;
    clouds: { all: number };
    cod: number;
    coord: { lat: number, lon: number };
    dt: number;
    id: number;
    main: {
        humidity: number;
        pressure: number;
        temp: number;
        temp_max: number;
        temp_min: number;
    }
    name: string;
    sys: {
        country: string
        id: number;
        message: number;
        sunrise: number;
        sunset: number;
        type: number;
    }
    visibility: number;
    weather: Array<{ description: string, icon: string, id: number, main: string }>
    length: number;
    wind: { deg: 250, speed: 7.2 }
}

interface TimeInfo {
    status: string; //	Status of the API query. Either OK or FAILED.
    message: string; //	Error message. Empty if no error.
    countryCode: string; //	Country code of the time zone.
    countryName: string; //	Country name of the time zone.
    zoneName: string; //	The time zone name.
    abbreviation: string; //	Abbreviation of the time zone.
    nextAbbreviation: string;
    gmtOffset: number; //	The time offset in seconds based on UTC time.
    dst: string; //	Whether Daylight Saving Time (DST) is used. Either 0 (No) or 1 (Yes).
    zoneStart: number; //	The Unix time in UTC when current time zone start.
    zoneEnd: number; //	The Unix time in UTC when current time zone end.
    timestamp: number; //	Current local time in Unix time. Minus the value with gmtOffset to get UTC time.
    formatted: string; //	Formatted timestamp in Y-m-d h:i:s format. E.g.: 2018-12-23 10:47:50
    totalPage: number; //	The total page of result when exceed 25 records.
    currentPage: number; //	Current page when navigating.
}

interface Info {
    weatherInfo: WeatherInfo;
    timeInfo: TimeInfo;
}

const APPID = 'ea310ffcda3d33d99668c98c65ce29d1';
const TimeAPIKey = 'WPZVKKS7PSC0';

const inputArray: Location[] = [
    {name: 'Berlin', postalCode: '10117'},
    {name: 'London', postalCode: 'NW7 3HU'}
];

const dataPromise = inputArray.map((location: Location) =>
    fetch(`http://api.openweathermap.org/data/2.5/weather?q=${location.name}&zip=${location.postalCode}&APPID=${APPID}`)
        .then((response: Response) => response.clone().json())
        .then((weatherInfo: WeatherInfo) => {
            return fetchJsonp(`http://api.timezonedb.com/v2.1/get-time-zone?key=${TimeAPIKey}&callback=callback&format=json&by=position&lng=${weatherInfo.coord.lon}&lat=${weatherInfo.coord.lat}`)
                .then((response: Response) => response.json())
                .then((timeInfo: TimeInfo) => ({weatherInfo, timeInfo}))
        }));

const Hello: React.SFC<{ infos: Info[] }> = (props) => {
    return (
        <table cellPadding={10}>
            <tbody>
            {props.infos.map((info: Info) => (
                <tr key={info.weatherInfo.id}>
                    <td className="city">{info.weatherInfo.name}</td>
                    <td><img src={`http://openweathermap.org/img/w/${info.weatherInfo.weather[0].icon}.png`} /></td>
                    <td className="weather">{info.weatherInfo.weather[0].description}</td>
                    <td className="time">{new Date(info.timeInfo.formatted).toLocaleString()}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

Promise.all(dataPromise).then((result: Info[]) => {
    ReactDOM.render(
        <Hello infos={result}/>,
        document.getElementById("root")
    );
});
