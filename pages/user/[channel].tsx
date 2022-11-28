import { useState, useEffect } from 'react';
import { Driver, Session, Connection, DriverData, FastestLap, UserTag, Theme } from '../../utils/interfaces';
import { DriverCard, Card, ChatCard, ConnectionCard, NotesCard, Button, Loading, Alert, SEO, Tooltip, RelativeCard } from '../../components';
import convertToImperial from '../../utils/convertToImperial';
import classnames from 'classnames';
import io from 'socket.io-client';
import { BsFillStopwatchFill, BsTwitter, BsGithub, BsChevronUp, BsChevronDown, BsDash, BsFillCameraVideoFill } from 'react-icons/bs';
import { SiGmail } from 'react-icons/si';
import { useRouter } from 'next/router'

let socket;
let connectionTimeout;

type DataCard = 
    "standings" | 
    "notepad" |
    "pitwall" |
    "welcome" |
    "connection" |
    "tires&fuel" |
    "inspector" |
    "relative" |
    "location" |
    "raceinfo" |
    "settings" |
    "map";

interface LayoutCard {
    card: DataCard,
    breakAfter: boolean;
}

export default function Home() {
	// Show the loading screen
    const [loading, setLoading] = useState(true);

	// Array of Driver objects, has a loading object by default
    const [drivers, setDrivers] = useState<Driver[]>([{class: { car: "N/A", id: 0, color: "ffffff" }, teamName: "", carIndex: 0,name: "Waiting to Recieve Standings...",userID: 0,carNumber: "0",isPaceCar: false,raceData: {position: 1,onPitRoad: true,class: 0,f2Time: 0,lap: 1,lapsCompleted: 0,lapPercent: 0,fastRepairsUsed: 0,},carData: {trackSurface: "NotInWorld",steer: 0,rpm: 0,gear: 0},lapTimes: {last: 0,best: { time: 0, lap: 0 }},flags: [],qualifyingResult: null, isAI: false, isSpectator: false, estTimeIntoLap: 0, license: null }])
	
	// Driver to show in the Driver Inspector
	const [highlightedDriver, setHighlightedDriver] = useState<Driver | null>(null);
    const [highlightedDriverIndex, setHighlightedDriverIndex] = useState<number | null>(null);

    // Display mode to use in the standings card
    // TODO: replace with a features array
    const [displayType, setDisplayType] = useState("Leader");

    // iRacing connection status (Not Pit Wall connection)
    const [connection, setConection] = useState<Connection>("connecting");

    // iRacing session data
    const [session, setSession] = useState<Session>({focusedCarIndex: -1,flags: [],isPALeagueRace: false,session: {number: 0,type: "LOADING",timeRemaining: 0,fastRepairs: 0,fastestLap: null,},track: {name: "Unknown Track",city: "Unknown City",id: -1,country: "Unknown Country",temperature: "N/A",length: "N/A",},weather: {windSpeed: "N/A",temperature: "N/A",skies: "N/A"}})
    
    // The text to show for the current flag
    const [flag, setFlag] = useState("");

    // The color to show for the current flag
    const [flagColor, setFlagColor] = useState(["#00000000","#00000000"]);

    // twitch username of the user running the Pit Wall
    const [channel, setChannel] = useState("");

    // Data about the driver running the Pit Wall
    const [driverData, setDriverData] = useState<DriverData>({tiresRemaining: { left: { front: 0, rear: 0 }, right: { front: 0, rear: 0 } },fuel: { remaining: 0, percent: 0 }, driver: null, carIndex: -1, laps: []});
    
    // Theme data, also includes preferences that should be saved between visits
    const [theme, setTheme] = useState<Theme>({teamNames: false, theme: "dark",backgroundImage: "https://i.gabirmotors.com/assets/other/carbon_fiber.jpg",backgroundColor: "#000000",useMetric: true,showTwitch:true,hideStandingsFeatures:[]})
    
    // Time and CarIndex for the driver with the fastest lap
    const [fastestLap, setFastestLap] = useState<FastestLap | null>(null);

    // is the user a streamer? currently can only be true
    const [isStreamer, setIsStreamer] = useState(false);

    // set of tags to show on the pit wall
    const [tags, setTags] = useState<null | UserTag[]>(null);

    // controls displaying of large elements like twitch chat
    const [isSmallScreen, setIsSmallScreen] = useState(true);

    // Is the fuel data public of private
    const [showFuel, setShowFuel] = useState(false);

    const router = useRouter();

    const socketInitializer = async () => {
        // Check for socket
        if (socket) return;

        // Create new socket
        socket = io("https://streaming.gabirmotors.com");

        socket.on('connect', () => {
            console.log('Connected to socket');
        })

        // Deal with data upon receiving it
        socket.on(`standings_update-${router.query.channel}`, (data) => {
            // If data has been received, then there is an iRacing connection
            setConection("connected")

            // Array that eill hold the sorted list of drivers and also excludes drivers with a position of 0
            let newDrivers = [];

            // JSON object of received data
            let parsed = JSON.parse(data)
            
            // Sort the drivers array by position
            let _d = parsed.sessionRacers.sort((a, b) => {
                return a.raceData.position - b.raceData.position;
            })

            // Set data
            setSession(parsed.sessionInfo);
            setDriverData(parsed.driverData);
            setChannel(parsed.options.channel);
            setIsStreamer(parsed.options.isStreamer);
            setTags(parsed.options.tags);
            setShowFuel(parsed.options.fuelIsPublic);
            
            // Remove drivers with a position of 0
            _d.forEach(d => {
                if (d.raceData.position !== 0) newDrivers.push(d);
            })

            if (newDrivers.length) setDrivers(newDrivers);

            let fastestLap = parsed.sessionInfo.session.fastestLap;

            if (fastestLap !== null && fastestLap[0].CarIdx !== 255) {
                setFastestLap(fastestLap[0]);
            }

            // If no data has been received for 5 seconds, set the connection to disconnected
            clearTimeout(connectionTimeout);
            connectionTimeout = setTimeout(() => {
                if (drivers.length <= 1) setConection("disconnected")
            }, 5000)
        })
    }

    useEffect(() => {
        drivers.forEach((d) => {
            if (d.carIndex === highlightedDriverIndex) {
                return setHighlightedDriver(d);
            }
        })
    }, [drivers])

    useEffect(() => {
        // Theme settings from localStorage
        let localTheme = localStorage.getItem("theme");
        if (localTheme !== null) {
            setTheme(JSON.parse(localTheme));
        }

        // If no data is recieved for the first 25 seconds after opening the pit wall, set the connection to disconnected
        setTimeout(() => {
            if (drivers.length <= 1) setConection("disconnected")
        }, 25000)

        // There are some features (like twitch chat) that should not be displayed on smaller screens
        setIsSmallScreen(window.innerWidth <= 1000);

        const resizeListener = (size: UIEvent) => setIsSmallScreen((size.target as Window).innerWidth <= 1000);
        window.addEventListener("resize", resizeListener)

        return () => {
            window.removeEventListener("resize", resizeListener);
        }
    }, [])

    useEffect(() => {
        if (router.query.channel === undefined) return;

        console.log("Connected to " + router.query.channel + "'s Pit Wall")

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
        const changeFlag = (text:string, bgColor:string, textColor:string, image:string) => {
            document.getElementById("flagAlert").style.backgroundImage = `${image}`;
            setFlag(text);
            setFlagColor([bgColor, textColor]);
        }

        if (session.flags.includes("Checkered")) changeFlag("Checkered Flag", "#222222", "#ffffff00", "url(https://i.gabirmotors.com/assets/other/pit_wall/checkered_flag.jpg)");
        else if (session.flags.includes("White")) changeFlag("Final Lap", "#ffffffee", "#000000", "");
        else if (session.flags.includes("Green")) changeFlag("Green Flag", "#00ff00", "#000000", "");
        else if (session.flags.includes("OneLapToGreen")) changeFlag("One Lap to Green", "#00ff00ee", "#000000", "");
        else if (session.flags.includes("CautionWaving")) changeFlag("Caution Thrown", "#ffff00ee", "#000000", "");
        else if (session.flags.includes("Caution")) changeFlag("Caution", "#ffff00", "#000000", "");
        else changeFlag("", "#000000", "#000000", "");
    }, [session])

    const getPoint = (length) => {
        if (typeof window !== "undefined") {
            let track = (document.getElementById("track") as unknown as SVGPathElement);
            if (!track) return { x: 0, y: 0 };
            return track.getPointAtLength(length * track.getTotalLength());
        } else return { x: 0, y: 0 }
    }

    return (
        <>
            <SEO
                title={`Gabir Motors Pit Wall ${channel !== "" ? "| " + channel : ""}`}
                url={`user/${channel}`}
            />

            <Loading loading={loading} />

            <div id="bg" className={`${theme.theme === "dark" ? "dark" : ""} background min-h-screen`}>
                {showFuel ? (
                    <Alert permaDismiss = {true} id = "fuel-page-2">Check out the new and improved <a href={`/user/${channel}/fuel`} className = "font-semibold hover:underline">Fuel Page</a>!</Alert>
                ): ""}

                <div className = "flex flex-row justify-center w-full pointer-events-none fixed bottom-20 z-40">
                    <div id = "flagAlert" className = {`p-4 px-12 fixed z-40 m-4 rounded-lg flex flex-row drop-shadow-lg lg:mr-8 transition duration-200 origin-top ${flag === "" ? "scale-y-0" : "scale-y-100"}`} style={{
                        backgroundColor: flagColor[0],
                        color: flagColor[1],
                    }}>
                        <div>
                            <span className = "font-bold">{ flag }</span>
                        </div>
                    </div>
                </div>

                <span className="text-white fixed p-2 z-40 opacity-50">Gabir Motors Pit Wall V1.8</span>


                {!isSmallScreen && isStreamer ? <ChatCard theme={theme.theme} channel={channel} show = {theme.showTwitch} /> : <div></div>}


                <div className="text-black dark:text-white px-4 pb-8 lg:px-16 columns-1 lg:columns-2 2xl:columns-3 gap-8 [column-fill:_auto] break-inside-avoid-column overflow-auto">
                    <div className = "mt-8 break-inside-avoid-column">
                        <Card id="standings-card" title={`Race Standings | ${(session.session.type === "PRACTICE" ? "Practicing" : (
                            session.session.type === "QUALIFY" ? "Qualifying" : (
                                session.session.type === "RACE" ? "Racing" : "Waiting"
                            )
                        ))}`}>
                            {session.session.type !== "LOADING" ? (
                                <>
                                    <div className="overflow-x-scroll whitespace-nowrap">
                                        <table className="border-separate">
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th></th>
                                                    <th></th>
                                                    <th></th>
                                                    <th></th>
                                                    <th></th>
                                                    <th></th>
                                                    <th></th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {drivers.map((d, i) => {
                                                    let displayTime = "";

                                                    if (displayType === "Interval") {
                                                        if (i === 0 && session.session.type === "RACE") displayTime = "INTERVAL";
                                                        else if (i !== 0) displayTime = (d.raceData.f2Time - drivers[i - 1].raceData.f2Time).toFixed(3);
                                                        else displayTime = d.raceData.f2Time.toFixed(3);
                                                    } else {
                                                        if (i === 0 && session.session.type === "RACE") displayTime = "LEADER";
                                                        else {
                                                            displayTime = (d.raceData.f2Time).toFixed(3);
                                                        }
                                                    }

                                                    let minutes = 0;
                                                    if (!isNaN(Number(displayTime))) {
                                                        let _seconds = Number(displayTime);
                                                        let _tempSeconds = _seconds;
                                                        _seconds = _seconds % 60;
                                                        minutes = (_tempSeconds - _seconds) / 60;
                                                        displayTime = `${session.session.type === "RACE" || displayType === "Interval" ? "+" : ""}${(minutes > 0 ? minutes + ":" : "")}${(_seconds < 10 ? (minutes > 0 ? "0" : "") + _seconds.toFixed(3) : _seconds.toFixed(3))}`
                                                    }

                                                    return (
                                                        <tr className={classnames([
                                                            "",
                                                            (d.raceData.onPitRoad ? "opacity-50" : ""),
                                                            (fastestLap !== null && fastestLap.CarIdx === d.carIndex ? "text-purple-700 dark:text-purple-500" : ""),
                                                        ])}>
                                                            <td><div className = {`h-1/1 ${d.carIndex === highlightedDriverIndex ? "bg-white" : ""} px-0.5 py-4`}></div></td>
                                                            <td>{session.focusedCarIndex === d.carIndex ? (
                                                                <BsFillCameraVideoFill />
                                                            ) : ""}</td>
                                                            <td className="px-4">{d.raceData.position}</td>
                                                            <td className={`text-center text-black p-1 rounded-md`} style = {{ backgroundColor: `#${d.class.color}` }}>#{d.carNumber}</td>
                                                            <td className="pl-2 py-1">
                                                                <a onClick={() => {
                                                                    setHighlightedDriverIndex(d.carIndex);
                                                                    setHighlightedDriver(d);
                                                                    console.log("Highlighting driver with index: " + d.carIndex)
                                                                }} className="block cursor-pointer">
                                                                    {theme.teamNames ? d.teamName : d.name}
                                                                </a>
                                                            </td>
                                                            <td>{(fastestLap !== null && fastestLap.CarIdx === d.carIndex) ? (
                                                                <BsFillStopwatchFill className="text-purple-600 mx-2" />
                                                            ) : ""}</td>
                                                            <td>{displayTime}</td>
                                                            {true ? (
                                                                <>
                                                                    <td className="pl-4">
                                                                        {d.qualifyingResult !== null ? (
                                                                            <span className="text-black dark:text-white">{(d.qualifyingResult.position + 1 < d.raceData.position) ? (
                                                                                <BsChevronDown className="text-2xl text-red-600 inline stroke-1" />
                                                                                ) : (
                                                                                    d.qualifyingResult.position + 1 === d.raceData.position ? (
                                                                                        <BsDash className="text-2xl text-gray-500 dark:text-gray-400 inline stroke-1" />
                                                                                        ) : (
                                                                                    <BsChevronUp className="text-2xl text-green-500 inline stroke-1" />
                                                                                )
                                                                            )} {Math.abs(d.raceData.position - (d.qualifyingResult.position + 1)) !== 0 ? Math.abs(d.raceData.position - (d.qualifyingResult.position + 1)) : ""}</span>
                                                                        ) : ""}
                                                                    </td>
                                                                    <td>
                                                                        {d.flags.includes("Repair") ? (
                                                                            <span>
                                                                                <svg className="h-8 inline" viewBox="0 0 285 285" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                    <g clip-path="url(#clip0_88_4)">
                                                                                        <path d="M42.702 0C33.885 0 31.824 7.152 31.824 15.969L31.824 22.316V38.481V273.944C31.824 279.949 36.697 284.822 42.702 284.822C48.707 284.822 53.58 279.949 53.58 273.944V38.481V22.316L53.58 15.969C53.585 7.158 51.524 0 42.702 0Z" fill="#9E9E9E" />
                                                                                        <path d="M53.5801 21.4586H264.15C269.673 21.4586 274.15 25.9358 274.15 31.4586V145.559C274.15 151.081 269.673 155.559 264.15 155.559H53.5801V21.4586Z" fill="black" />
                                                                                        <circle cx="163.865" cy="88.5086" r="44.1415" fill="#FF7A00" />
                                                                                    </g>
                                                                                </svg>
                                                                            </span>
                                                                        ) : ""}

                                                                        {d.flags.includes("Black") ? (
                                                                            <span>
                                                                                <svg className="h-8 inline" viewBox="0 0 285 285" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                    <g clip-path="url(#clip0_88_4)">
                                                                                        <path d="M42.702 0C33.885 0 31.824 7.152 31.824 15.969L31.824 22.316V38.481V273.944C31.824 279.949 36.697 284.822 42.702 284.822C48.707 284.822 53.58 279.949 53.58 273.944V38.481V22.316L53.58 15.969C53.585 7.158 51.524 0 42.702 0Z" fill="#9E9E9E" />
                                                                                        <path d="M53.5801 21.4586H264.15C269.673 21.4586 274.15 25.9358 274.15 31.4586V145.559C274.15 151.081 269.673 155.559 264.15 155.559H53.5801V21.4586Z" fill="black" />
                                                                                    </g>
                                                                                </svg>
                                                                            </span>
                                                                        ) : ""}

                                                                        {d.flags.includes("Checkered") ? (
                                                                            <span>
                                                                                <svg className="h-8 inline" viewBox="0 0 285 285" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                    <g clip-path="url(#clip0_90_34)">
                                                                                        <path d="M42.7023 0C33.8853 0 31.8242 7.152 31.8242 15.969L31.8243 22.316V38.481V273.944C31.8243 279.949 36.6973 284.822 42.7023 284.822C48.7073 284.822 53.5803 279.949 53.5803 273.944V38.481V22.316L53.5802 15.969C53.5852 7.158 51.5243 0 42.7023 0Z" fill="#9E9E9E" />
                                                                                        <path d="M53.5801 21.4586H264.15C269.673 21.4586 274.15 25.9358 274.15 31.4586V145.559C274.15 151.081 269.673 155.559 264.15 155.559H53.5801V21.4586Z" fill="url(#pattern0)" />
                                                                                    </g>
                                                                                    <defs>
                                                                                        <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="0.500532" height="0.823286">
                                                                                            <use xlinkHref="#image0_90_34" transform="scale(0.00782082 0.0128638)" />
                                                                                        </pattern>
                                                                                        <clipPath id="clip0_90_34">
                                                                                            <rect width="284.822" height="284.822" fill="white" />
                                                                                        </clipPath>
                                                                                        <image id="image0_90_34" width="64" height="64" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAONJREFUeF7t20EOhEAIRFG4/6F7DvEnYeFzryQIv6pBd2behOu9dPvsbog+k+NLgArQAqmJcw9iAAhSgZKB3IJkkAySQTJ4CiE+gA8oBeg0mH3Ai084P89HhqwEqIA209ICsQdjAeaZIgaAYKxBDMCAYy8fXwAIgiAIcoJpJEYGI4VjB3YrbC9gL2AvkCB43cM5PgZgAAZgQFnNZAhdGykQBEEQBEEQDBmgAm2glM/z+QUYisYUGoldO7kY32IEAzCg6RgIRgjFAsw+AgRBMNYgBmCAT2TCYfoPPz/HCqQCX1eBHzHnv7C7WhBSAAAAAElFTkSuQmCC" />
                                                                                    </defs>
                                                                                </svg>
                                                                            </span>
                                                                        ) : ""}
                                                                    </td>
                                                                </>
                                                            ) : ""}
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {drivers.length > 1 ? (
                                        <>
                                            <Button block={true} click={() => {
                                                if (displayType === "Interval") setDisplayType("Leader");
                                                else setDisplayType("Interval");
                                            }}>Display Mode: {displayType}</Button>
                                        </>
                                    ) : ""}
                                </>
                            ) : (
                                <h1>Waiting to Recieve Data</h1>
                            )}
                        </Card>
                    </div>
                    
                    <div className = "mt-8 break-inside-avoid-column">
                        <NotesCard />
                    </div>
                                
                    <div className = "2xl:break-before-column mt-8 break-inside-avoid-column">
                        {channel !== "" ? (
                            <div id="CurrentRacer" className = "break-inside-avoid">
                                <div className={`handle block p-4 bg-light-card-handle dark:bg-dark-card-handle transition duration-300 rounded-lg`}>
                                    <span className="font-bold text-center lg:text-left block lg:inline">{channel}'s Pit Wall</span>

                                    {tags !== null ? (
                                        <span className="mx-auto lg:ml-2 block lg:inline mt-4">
                                            {/* {JSON.stringify(tags, null, 4)} */}
                                            {tags.map((tag, i) => {
                                                if (tag === "beta_tester") {
                                                    return <span className="mx-1 px-4 py-1 rounded-full bg-blue-600 text-white whitespace-nowrap">Beta Tester</span>
                                                }

                                                if (tag === "vip") {
                                                    return <span className="mx-1 px-4 py-1 rounded-full bg-purple-600 text-white whitespace-nowrap">VIP</span>
                                                }

                                                if (tag === "early") {
                                                    return <span className="mx-1 px-4 py-1 rounded-full bg-green-500 text-white whitespace-nowrap">Early User</span>
                                                }
                                            })}
                                        </span>
                                    ) : ""}
                                </div>
                            </div>
                        ) : (
                            <div id="CurrentRacer" className = "break-inside-avoid">
                                <div className={`handle block p-4 bg-light-card-handle dark:bg-dark-card-handle transition duration-300 rounded-lg`}>
                                    <span className="font-bold text-center lg:text-left block lg:inline">Loading {router.query.channel}'s Pit Wall</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className = "mt-8 break-inside-avoid-column">
                        <Card id="welcome-card" title="Welcome!">
                            <h1>Welcome to the</h1>
                            <h2 className="font-bold text-center text-5xl acumin">GABIR MOTORS PIT WALL</h2>
                            <img src="https://i.gabirmotors.com/assets/other/pit_wall.png" alt="Gabir Motors Logo" className="w-64 m-auto mt-4" />
                            <hr className="m-4" />
                            <h5 className="text-center mt-2 text-xl italic">Made By <span className="font-bold">Gabe Krahulik</span></h5>
                            <div className="flex flex-row justify-center text-4xl mt-4 gap-8">
                                <a href="https://twitter.com/gabekrahulik" target="_new">
                                    <BsTwitter className="hover:text-twitter-brand transition-all duration-200" />
                                </a>
                                <a href="https://github.com/LilSpartan" target="_new">
                                    <BsGithub className="hover:text-github-brand transition-all duration-200" />
                                </a>
                                <a href="mailto:gabekrahulik@gmail.com" target="_new">
                                    <SiGmail className="hover:text-gmail-brand transition-all duration-200" />
                                </a>
                            </div>
                        </Card>
                    </div>

                    <div className = "mt-8 break-inside-avoid-column">
                        <ConnectionCard connection={connection} />
                    </div>

                    <div className = "mt-8 break-inside-avoid-column">
                        <Card title="Tires and Fuel">
                            {(driverData !== undefined) ? (
                                <>
                                    <h1>Remaining Tires</h1>
                                    <div className="flex flex-col justify-around">
                                        <div className="flex flex-row justify-around">
                                            <div>
                                                <span className="font-bold text-xl">Left Front</span><br />
                                                <span className="text-center block">{driverData.tiresRemaining.left.front}</span>
                                            </div>
                                            <div>
                                                <span className="font-bold text-xl">Right Front</span><br />
                                                <span className="text-center block">{driverData.tiresRemaining.right.front}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-row justify-around">
                                            <div>
                                                <span className="font-bold text-xl">Left Rear</span><br />
                                                <span className="text-center block">{driverData.tiresRemaining.left.rear}</span>
                                            </div>
                                            <div>
                                                <span className="font-bold text-xl">Right Rear</span><br />
                                                <span className="text-center block">{driverData.tiresRemaining.right.rear}</span>
                                            </div>
                                        </div>
                                    </div>
                                    { showFuel ? (
                                        <div>
                                            {/* <div>
                                                <span className="font-bold">Fuel Remaining: <span className="font-normal">{convertToImperial(driverData.fuel.remaining, "L", theme.useMetric)[0].toFixed(3)} {theme.useMetric ? "L" : "Gallons"} ({(driverData.fuel.percent * 100).toFixed(3)}%)</span></span><br />
                                            </div> */}

                                            <hr className="mx-4 my-4" />
                                            <Button block self link = {`/user/${channel}/fuel`}>
                                                Fuel Data
                                            </Button>
                                        </div>
                                    ) : <div /> }
                                </>
                            ) : ""}
                        </Card>
                    </div>
                    
                    <div className = "mt-8 break-inside-avoid-column">
                        <DriverCard driver={highlightedDriver} session={session} theme = {theme} />
                    </div>

                    <div className = "mt-8 break-after-column break-before-avoid-column">
                        <RelativeCard drivers = {drivers} highlightedDriver = {highlightedDriver} session = {session} theme = {theme} />
                    </div>

                    <div className = "2xl:break-before-column mt-8 break-inside-avoid">
                        <Card title="Location">
                            <h1>{session.track.name}</h1>
                            <h2 className="text-center text-lg">{session.track.city}, {session.track.country}</h2>
                        </Card>
                    </div>

                    <div className = "mt-8 break-inside-avoid">
                        <Card title="Race Info">
                            <div className="flex flex-col md:flex-row">
                                <div className="mr-4">
                                    <span className="font-bold">Time Remaining: <span className="font-normal">{new Date(session.session.timeRemaining * 1000).toISOString().substr(11, 8)}</span></span><br />
                                    <span className="font-bold">Quick Repairs: <span className="font-normal">{session.session.fastRepairs}</span></span><br />
                                    <span className="font-bold">Track Length: <span className="font-normal">{convertToImperial(Number(session.track.length.split(' ')[0]), "KM", theme.useMetric)[0].toFixed(2)} {theme.useMetric ? "km" : "Miles"}</span></span><br />
                                    <span className="font-bold">Lap: <span className="font-normal">{drivers[0].raceData.lap}</span></span><br />
                                </div>
                                <div>
                                    <span className="font-bold">Skies: <span className="font-normal">{session.weather.skies}</span></span><br />
                                    <span className="font-bold">Wind: <span className="font-normal">{convertToImperial(Number(session.weather.windSpeed.split(' ')[0]), "M", theme.useMetric)[0].toFixed(2)} {theme.useMetric ? "m/s" : "mph"}</span></span><br />
                                    <span className="font-bold">Track Temperature: <span className="font-normal">{convertToImperial(Number(session.track.temperature.split(' ')[0]), "C", theme.useMetric)[0].toFixed(2)} {theme.useMetric ? "C" : "F"}</span></span><br />
                                    <span className="font-bold">Air Temperature: <span className="font-normal">{convertToImperial(Number(session.weather.temperature.split(' ')[0]), "C", theme.useMetric)[0].toFixed(2)} {theme.useMetric ? "C" : "F"}</span></span><br />
                                </div>
                            </div>

                        </Card>
                    </div>

                    <div className = "mt-8 break-after-avoid-all">
                        <Card title="Settings">
                            <Button block={true} click={() => {
                                setTheme({ ...theme, theme: (theme.theme === "dark" ? "light" : "dark") })
                            }}>Change Theme</Button>

                            {/* Chat Channel: <input onChange = {(e) => { setChannel(e.target.value) }} type="text" className = "mt-6 rounded-lg bg-light-card-handle dark:bg-dark-card-handle py-2 px-4 transition duration-200" placeholder='Channel' value = {channel}/><br /> */}
                            Background Image: <select onChange={(e) => {
                                setTheme({ ...theme, backgroundImage: e.target.value })
                            }} value={theme.backgroundImage} name="image" id="image" className="mt-2 rounded-lg bg-light-card-handle dark:bg-dark-card-handle py-2 px-4 transition duration-200">
                                <option value="https://gabirmotors.com/img/image.jpg">Mike Racecar</option>
                                <option value="https://i.gabirmotors.com/assets/other/carbon_fiber.jpg">Carbon Fiber</option>
                                <option value="">none</option>
                            </select><br />
                            Background Color: <input value={theme.backgroundColor} type="color" onChange={(e) => {
                                setTheme({ ...theme, backgroundColor: e.target.value })
                            }} className="mt-2 rounded-lg bg-light-card-handle dark:bg-dark-card-handle transition duration-200" /><br /><br />
                            Show Twitch Widget <input type="checkbox" name="showTwitch" id="showTwitch" onChange = {(e) => {
                                setTheme({ ...theme, showTwitch: e.target.checked })
                            }} checked = {theme.showTwitch} /><br />
                            Use Metric Units <input type="checkbox" name="useMetric" id="useMetric" onChange = {(e) => {
                                setTheme({ ...theme, useMetric: e.target.checked })
                            }} checked = {theme.useMetric} /><br />
                            Show Team Names in Standings <input type="checkbox" name="useMetric" id="useMetric" onChange = {(e) => {
                                setTheme({ ...theme, teamNames: e.target.checked })
                            }} checked = {theme.teamNames} />
                        </Card>
                    </div>

                    <div className = "mt-8 break-after-column break-before-avoid-column">
                        <Card title="Track Map">
                            <svg width="100%" height="auto" viewBox="0 0 111 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path id="track" d="M92.6857 5.93787H17.6857C10.7821 5.93787 5.18567 11.5343 5.18567 18.4379C5.18567 25.3414 10.7821 30.9379 17.6857 30.9379H92.6857C99.5892 30.9379 105.186 25.3414 105.186 18.4379C105.186 11.5343 99.5892 5.93787 92.6857 5.93787Z" stroke="white" stroke-width="1" />

                                {drivers.map((driver, index) => {
                                    let point = getPoint(driver.raceData.lapPercent);

                                    let radius = 1.5;
                                    if (driver.carIndex === highlightedDriverIndex) radius = 2;

                                    let colors = [
                                        "#888888cc",
                                        "#ffffffff"
                                    ]

                                    if (driver.raceData.onPitRoad) {
                                        return (
                                            <circle r="0.8" stroke="black" strokeWidth={driver.carIndex === highlightedDriverIndex ? 0.3 : 0} cx={1 * driver.carIndex} cy={1} fill={colors[driver.carIndex === highlightedDriverIndex ? 1 : 0]} className="circle" id={"car-" + driver.carIndex}></circle>
                                        )
                                    } else {
                                        return (
                                            <circle r={radius} stroke="black" strokeWidth={driver.carIndex === highlightedDriverIndex ? 0.3 : 0} cx={point.x} cy={point.y} fill={colors[driver.carIndex === highlightedDriverIndex ? 1 : 0]} className="circle" id={"car-" + driver.carIndex}></circle>
                                        )
                                    }


                                })}
                            </svg>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}