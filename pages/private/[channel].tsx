import { useState, useEffect } from 'react';
import { Driver, Session, Connection, DriverData, FastestLap, UserTag, Theme } from '../../utils/interfaces';
import { DriverCard, Card, ChatCard, ConnectionCard, NotesCard, Button, Loading, Alert, SEO, Tooltip } from '../../components';
import convertToImperial from '../../utils/convertToImperial';
import classnames from 'classnames';
import io from 'socket.io-client';
import { BsFillStopwatchFill, BsTwitter, BsGithub, BsChevronUp, BsChevronDown, BsDash, BsFillCameraVideoFill } from 'react-icons/bs';
import { SiGmail } from 'react-icons/si';
import { useRouter } from 'next/router'
import secondsToFormatted from '../../utils/secondsToFormatted';

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

    const router = useRouter();

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

            setSession(parsed.sessionInfo);
            setDriverData(parsed.driverData);
            setChannel(parsed.options.channel);
            setTags(parsed.options.tags);
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

    return (
        <>
            <SEO
                title={`Gabir Motors Pit Wall | ${channel}`}
                url={`private/${channel}`}
            />

            <Loading loading={loading} />

            <div id="bg" className={`${theme.theme === "dark" ? "dark" : ""} background min-h-screen`}>
                {/* <Alert permaDismiss = {true} id = "new-layout">A few things have changed with the Pit Wall layout, if you run into any problems, please <a href="mailto:gabekrahulik@gmail.com?subject=Pit Wall Layout Issues" className = "font-semibold hover:underline" target = "_new">let me know</a></Alert> */}

                <span className="text-white fixed p-2 z-40 opacity-50">Gabir Motors Pit Wall V1.6</span>

                <div className="text-black dark:text-white p-10 pb-8">
                    <Card title = "Fuel Info">
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


                                    return (
                                        <tr className = "text-center">
                                            <td className = "p-1">{ lap.lapNumber }</td>
                                            <td className = "p-1">{ convertToImperial(lap.fuelAtStartLiters, "L", theme.useMetric)[0].toFixed(3)} {theme.useMetric ? "L" : "Gallons"} ({(lap.fuelAtStartPct * 100).toFixed(3)}%)</td>
                                            <td className = "p-1">{ lap.fuelUsedLiters !== -1 ? (
                                                <span>{ convertToImperial(lap.fuelUsedLiters, "L", theme.useMetric)[0].toFixed(3)} {theme.useMetric ? "L" : "Gallons"} ({(lap.fuelUsedPct * 100).toFixed(3)}%)</span>
                                            ) : <span className = "italic text-gray-400">Lap Not Completed</span> }</td>
                                            <td className="p-1 w-1/4">{ secondsToFormatted(lap.lapTime) }</td>
                                            <td className="p-1">{ lap.sessionType }</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </div>
        </>
    )
}