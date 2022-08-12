import { useState, useEffect } from 'react';
import { Driver, Session, Connection, DriverData, FastestLap, UserTag, Theme } from '../../../utils/interfaces';
import { DriverCard, Card, ChatCard, ConnectionCard, NotesCard, Button, Loading, Alert, SEO, Tooltip } from '../../../components';
import convertToImperial from '../../../utils/convertToImperial';
import classnames from 'classnames';
import io from 'socket.io-client';
import { BsQuestionCircle } from 'react-icons/bs';
import { SiGmail } from 'react-icons/si';
import { useRouter } from 'next/router'
import secondsToFormatted from '../../../utils/secondsToFormatted';

let socket;
let connectionTimeout;

export default function Home() {
	// Show the loading screen
    const [loading, setLoading] = useState(true);

    const [connection, setConection] = useState<Connection>("connecting");
    const [session, setSession] = useState<Session>({focusedCarIndex: -1,flags: [],isPALeagueRace: false,session: {number: 0,type: "LOADING",timeRemaining: 0,fastRepairs: 0,fastestLap: null,},track: {name: "Unknown Track",city: "Unknown City",id: -1,country: "Unknown Country",temperature: "N/A",length: "N/A",},weather: {windSpeed: "N/A",temperature: "N/A",skies: "N/A"}})
    const [channel, setChannel] = useState("");
    const [driverData, setDriverData] = useState<DriverData>({tiresRemaining: { left: { front: 0, rear: 0 }, right: { front: 0, rear: 0 } },fuel: { remaining: 0, percent: 0 }, driver: null, carIndex: -1, laps: []});
    const [theme, setTheme] = useState<Theme>({teamNames: false, theme: "dark",backgroundImage: "https://i.gabirmotors.com/assets/other/carbon_fiber.jpg",backgroundColor: "#000000",useMetric: true,showTwitch:true,hideStandingsFeatures:[]})
    const [debug, setDebug] = useState(false);
    const [tags, setTags] = useState<null | UserTag[]>(null);
    const [showFuel, setShowFuel] = useState(false);
    const [password, setPassword] = useState('a');
    const [authenticated, setAuthenticated] = useState(false);
    const [inputPassword, setInputPassword] = useState('');

    const [startLap, setStartLap] = useState(0);
    const [endLap, setEndLap] = useState(3);
    const [minimumUsedLiters, setMinimumUsedLiters] = useState(0.001);
    const [useRangeFilter, setUseRangeFilter] = useState(false);

    const [averageLiters, setAverageLiters] = useState(0);
    const [averagePct, setAveragePct] = useState(0);

    const router = useRouter();

    const checkPasswords = () => {
        if (password === '') return;
        if (inputPassword === password) {
            setAuthenticated(true);
        }
    }

    const socketInitializer = async () => {
        if (socket) return;
        socket = io("https://streaming.gabirmotors.com");

        socket.on('connect', () => {
            console.log('connected');
        })

        console.log(`Connected to channel: ${router.query.channel}`);

        socket.on(`standings_update-${router.query.channel}`, (data) => {
            setConection("connected")
            let parsed = JSON.parse(data)

            if (parsed.options.fuelIsPublic !== showFuel) {
                setAuthenticated(false);
            }
            // console.log(setPassword(parsed.options.password as string), parsed.options.password, "Password");

            setSession(parsed.sessionInfo);
            setDriverData(parsed.driverData);
            setChannel(parsed.options.channel);
            setTags(parsed.options.tags);
            setShowFuel(parsed.options.fuelIsPublic);
            setPassword(parsed.options.password);
        })
    }

    useEffect(() => {
        let localTheme = localStorage.getItem("theme");
        if (localTheme !== null) {
            setTheme(JSON.parse(localTheme));
        }
    }, [])

    useEffect(() => {
        if (router.query.channel === undefined) return;

        console.log(router.query.channel)

        socketInitializer().then(() => {
            setLoading(false);
        });
    }, [router.query.channel])

    useEffect(() => {
        localStorage.setItem("theme", JSON.stringify(theme));
        document.getElementById("bg").style.backgroundImage = `url(${theme.backgroundImage})`;
        document.getElementById("bg").style.backgroundColor = `${theme.backgroundColor}`;
    }, [theme])
    
    useEffect(() => {   
        setAuthenticated(false);
    }, [password])

    useEffect(() => {
        if (driverData.laps.length < 3) return;
        if (startLap < driverData.laps[driverData.laps.length - 1].lapNumber) return setStartLap(driverData.laps[driverData.laps.length - 1].lapNumber);
        if (endLap <= startLap) setEndLap(startLap + 1);

        let runningTotalLiters = 0;
        let runningTotalPct = 0;
        let lapsCalculated = 0;

        if (useRangeFilter) {
            let _reversed = [...driverData.laps].reverse();
            if (_reversed === undefined) return;
            for (let i = startLap + 1; i <= endLap + 1; i ++) {
                if (_reversed[i].fuelUsedLiters !== -1 && _reversed[i].fuelUsedLiters > minimumUsedLiters) {
                    runningTotalLiters += _reversed[i].fuelUsedLiters;
                    runningTotalPct += _reversed[i].fuelUsedPct;
                    lapsCalculated ++;
                }
            }
        } else {
            for (let i = 0; i < driverData.laps.length; i ++) {
                if (driverData.laps[i].fuelUsedLiters !== -1 && driverData.laps[i].fuelUsedLiters > minimumUsedLiters) {
                    runningTotalLiters += driverData.laps[i].fuelUsedLiters;
                    runningTotalPct += driverData.laps[i].fuelUsedPct;
                    lapsCalculated ++;
                }
            }
        }

        setAverageLiters(runningTotalLiters / lapsCalculated);
        setAveragePct(runningTotalPct / lapsCalculated);
    }, [startLap, endLap, useRangeFilter, minimumUsedLiters, driverData.laps])

    return (
        <>
            <SEO
                title={`Gabir Motors Pit Wall Fuel Calculations`}
                url={`user/${channel}/fuel`}
            />

            <Loading loading={loading} />

            <div id="bg" className={`${theme.theme === "dark" ? "dark" : ""} background min-h-screen`}>
                {/* <Alert permaDismiss = {true} id = "new-layout">A few things have changed with the Pit Wall layout, if you run into any problems, please <a href="mailto:gabekrahulik@gmail.com?subject=Pit Wall Layout Issues" className = "font-semibold hover:underline" target = "_new">let me know</a></Alert> */}

                <span className="text-white fixed p-2 z-40 opacity-50">Gabir Motors Pit Wall V1.7</span>

                { showFuel || authenticated ? (
                    <div className="text-black dark:text-white p-10 pb-8">
                        <Card title = "Fuel Calculations">
                            <div className="flex flex-row gap-8 mb-8">
                                <span className="font-bold text-4xl">Filters</span>
                                
                                <div>
                                    <span className = "font-bold text-lg"><Tooltip message='Any laps that used less than this amount of fuel will be ignored when calculating the average'><span className = "mr-2">Minimum Fuel Use (Liters)</span> <BsQuestionCircle /></Tooltip></span><br />
                                    <input onChange = {(e) => { setMinimumUsedLiters(Number(e.target.value)) }} type="number" className = "rounded-lg bg-light-card-handle dark:bg-dark-card-handle py-2 px-4 transition duration-200" placeholder='Minimum (Liters)' value = {minimumUsedLiters} id = "minimum" name = "minimum" />
                                </div>

                                {driverData.laps.length > 5 ? (
                                    <div>
                                        <span className = "font-bold text-lg">Use Range</span><br />
                                        <input onChange = {(e) => { setUseRangeFilter(e.target.checked) }} type="checkbox" className = "rounded-lg bg-light-card-handle dark:bg-dark-card-handle py-2 px-4 transition duration-200" checked = {useRangeFilter} />
                                    </div>
                                ) : ""}

                                { useRangeFilter ? (
                                    <div>
                                        <span className = "font-bold text-lg">Start</span><br />
                                        <input onChange = {(e) => { 
                                            if (Number(e.target.value) < 0) e.target.value = "0";
                                            setStartLap(Number(e.target.value));   
                                        }} type="number" className = "rounded-lg bg-light-card-handle dark:bg-dark-card-handle py-2 px-4 transition duration-200" placeholder='Range Start' value = {startLap} id = "start" name = "start" max = {driverData.laps.length - 3} min = {driverData.laps[driverData.laps.length - 1].lapNumber}/>
                                    </div>
                                ) : <div /> }

                                { useRangeFilter ? (
                                    <div>
                                        <span className = "font-bold text-lg">End</span><br />
                                        <input onChange = {(e) => { 
                                            if (Number(e.target.value) > driverData.laps.length - 2) e.target.value = String(driverData.laps.length - 2);
                                            setEndLap(Number(e.target.value));  
                                        }}  type="number" className = "rounded-lg bg-light-card-handle dark:bg-dark-card-handle py-2 px-4 transition duration-200" placeholder='Range End' value = {endLap} id = "end" name = "end" max = {driverData.laps.length - 2} min = {driverData.laps[driverData.laps.length - 1].lapNumber}/>
                                    </div>
                                ) : <div /> }
                            </div>

                            <span className="font-bold">Average Fuel Used: <span className="font-normal">{ (() => {
                                
                                
                                // console.log(lapsCalculated, runningTotalLiters, runningTotalLiters / lapsCalculated, convertToImperial((runningTotalLiters / lapsCalculated), "L", theme.useMetric)[0].toFixed(3))
                                
                                return `${ convertToImperial(averageLiters, "L", theme.useMetric)[0].toFixed(3)} ${theme.useMetric ? "L" : "Gallons"} (${(averagePct * 100).toFixed(3)}%)`;
                            })() }</span></span><br /><br />
                            <Button self link = {`/user/${channel}`}>Go Back</Button>
                        </Card>

                        <Card title = "Fuel Info" className = "mt-8">
                            <table className="border-separate">
                                <thead>
                                    <th>Lap</th>
                                    <th>Fuel at Start</th>
                                    <th>Fuel Used</th>
                                    <th>Lap Time</th>
                                    <th>Session Type</th>
                                </thead>

                                <tbody>
                                    {driverData.laps.map((lap, i) => {
                                        if (lap.lapNumber < 0) return "";

                                        return (
                                            <tr className = "text-center">
                                                <td className = "p-1">{ lap.lapNumber }</td>
                                                <td className = "p-1">{ convertToImperial(lap.fuelAtStartLiters, "L", theme.useMetric)[0].toFixed(3)} {theme.useMetric ? "L" : "Gallons"} ({(lap.fuelAtStartPct * 100).toFixed(3)}%)</td>
                                                <td className = "p-1">{ lap.fuelUsedLiters !== -1 ? (
                                                    <span>{ convertToImperial(lap.fuelUsedLiters, "L", theme.useMetric)[0].toFixed(3)} {theme.useMetric ? "L" : "Gallons"} ({(lap.fuelUsedPct * 100).toFixed(3)}%)</span>
                                                ) : <span className = "italic text-gray-400">{ convertToImperial((lap.fuelAtStartLiters - driverData.fuel.remaining), "L", theme.useMetric)[0].toFixed(3)} {theme.useMetric ? "L" : "Gallons"} ({((lap.fuelAtStartPct - driverData.fuel.percent) * 100).toFixed(3)}%)</span> }</td>
                                                <td className="p-1 w-1/4">{ secondsToFormatted(lap.lapTime) }</td>
                                                <td className="p-1">{ lap.sessionType }</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </Card>
                    </div>
                ) : (
                    <div className="text-black dark:text-white p-10 pb-8">
                        <Card title = "This Page is Private">
                            <h1 className="text-left text-4xl">This Page is Private</h1>
                            <h2 className="text-left text-2xl">Enter the Password to Continue</h2>
                            
                            <input onChange = {(e) => { setInputPassword(e.target.value) }} type="text" className = "mt-6 rounded-lg bg-light-card-handle dark:bg-dark-card-handle py-2 px-4 transition duration-200 mx-4" placeholder='Password' value = {inputPassword}/>
                            <Button click = {checkPasswords}>Confirm</Button>
                            <br /> <br />
                            <Button self link = {`/user/${channel}`}>Go Back</Button>
                        </Card>
                    </div>
                )}
            </div>
        </>
    )
}