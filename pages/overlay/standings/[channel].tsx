import { useState, useEffect } from 'react';
import { Session, Driver, FastestLap } from '../../../utils/interfaces';
import classnames from 'classnames';
import io from 'socket.io-client';
import { BsFillStopwatchFill } from 'react-icons/bs';
import { useRouter } from 'next/router';

let socket;

const TrackOverlay = () => {
    const [drivers, setDrivers] = useState<Driver[]>([
		{ 
			carIndex: 0, 
			name: "Waiting to Recieve Standings...", 
			userID: 0, 
			carNumber: "0", 
			classID: 0, 
			isPaceCar: false,
			raceData: { 
				position: 1, 
				onPitRoad: true, 
				class: 0, 
				f2Time: 0, 
				lap: 1, 
				lapsCompleted: 0 ,
				lapPercent: 0,
				fastRepairsUsed: 0,
			},
			carData: {
				trackSurface: "NotInWorld",
				steer: 0,
				rpm: 0,
				gear: 0
			},
			lapTimes: {
				last: 0,
				best: { time: 0, lap: 0 }
			}, 
			flags: [],
			qualifyingResult: null,
		}
	])
    const [fastestLap, setFastestLap] = useState<FastestLap | null>(null);
    const [session, setSession] = useState<Session>({
		flags: [
			
		],
		isPALeagueRace: false,
		session: {
			number: 0,
			type: "LOADING",
			timeRemaining: 0,
			fastRepairs: 0,
			fastestLap: null,
		},
		track: {
		  name: "Unknown Track",
		  city: "Unknown City",
		  id: -1,
		  country: "Unknown Country",  
		  temperature: "N/A",
		  length: "N/A",
		},
		weather: {
			windSpeed: "N/A",
			temperature: "N/A",
			skies: "N/A"
		}
	})

    const [flagColor, setFlagColor] = useState("#222222");

	const router = useRouter();

    const socketInitializer = async () => {
		if (socket) return;
		// prompt to create a new socket just in case
        await fetch('/api/socket')

        // Create new socket
        socket = io();

		socket.on('connect', () => {
			console.log('connected');
		})
		console.log(`standings_update-${router.query.channel}`);
		socket.on(`standings_update-${router.query.channel}`, (data) => {
			let parsed = JSON.parse(data)

			setSession(parsed.sessionInfo)

            let newDrivers = [];

			let _d = parsed.sessionRacers.sort((a, b) => {
				return a.raceData.position - b.raceData.position;
			})
			
			_d.forEach(d => {
				if (d.raceData.position !== 0) newDrivers.push(d);
			})
			
			if (newDrivers.length) setDrivers(newDrivers);

			let fLap = parsed.sessionInfo.session.fastestLap;

			// console.log(fLap)

			if (fLap !== null && fLap[0].CarIdx !== 255) {
				setFastestLap(fLap[0]);
			}
		})
	}

	useEffect(() => {
		if (router.query.channel === undefined) return;
		
		console.log(router.query.channel)

		socketInitializer();
	}, [router.query.channel])

    useEffect(() => {
		if (session.flags.includes("Checkered")) {
			setFlagColor("#ffffff");
		} else if (session.flags.includes("White")) {
			setFlagColor("#ffffff77");
		} else if (session.flags.includes("Green")) {
			setFlagColor("#00ff00");
		} else if (session.flags.includes("OneLapToGreen")) {
			setFlagColor("#00ff0077");
		} else if (session.flags.includes("CautionWaving")) {
			setFlagColor("#ffff0077");
		} else if (session.flags.includes("Caution")) {
			setFlagColor("#ffff00");
		} else {
			setFlagColor("#222222");
		}
	}, [session])

    return (
		<div className = "h-auto flex flex-row justify-start">
			<div className = {`bg-[#222222dd] text-white px-2 py-4 rounded-l-xl flex flex-col transition duration-500 mt-4 ml-4 border-8 border-r-0 shadow-2xl`} style = {{
                borderColor: flagColor
            }}>
				<div className="flex flex-col justify-center">
                    <div>
                        <img src="https://i.gabirmotors.com/assets/other/pit_wall.png" className = "h-12 mx-auto" />

                        <h2 className = "text-center font-bold text-lg mt-2">{ new Date(session.session.timeRemaining * 1000).toISOString().substr(11, 8) } Remaining</h2>
				        <hr className="mx-4 my-2" />
                    </div>

                    <div>
                        <table className = "border-separate">
                            {drivers.map((d, i) => {
                                let displayTime = "";

                                if (i === 0 && session.session.type === "RACE") displayTime = "INTERVAL";
                                else if (i !== 0) displayTime = (d.raceData.f2Time - drivers[i - 1].raceData.f2Time).toFixed(3);
                                else displayTime = d.raceData.f2Time.toFixed(3);


                                let minutes = 0;
                                if (!isNaN(Number(displayTime))) {
                                    let _seconds = Number(displayTime);
                                    let _tempSeconds = _seconds;
                                    _seconds = _seconds % 60;
                                    minutes = (_tempSeconds - _seconds) / 60;
                                    displayTime = `+ ${(minutes > 0 ? minutes + ":" : "")}${(_seconds < 10 ? (minutes > 0 ? "0" : "") + _seconds.toFixed(3) : _seconds.toFixed(3))}`
                                }

                                return (
                                    <tr className = {classnames([
                                        "",
                                        (d.raceData.onPitRoad ? "text-gray-500 dark:text-gray-400" : ""),
                                        // (fastestLap !== null && fastestLap.CarIdx === d.carIndex ? "text-purple-700 dark:text-purple-500" : ""),
                                        "text-xl", "mt-1"
                                    ])}>
                                        <td className = "text-center bg-white text-black p-1 rounded-md">#{ d.carNumber }</td>
                                        <td className = "px-2 py-1">
                                            { d.name.split(" ")[0] } { d.name.split(" ")[1][0] }.
                                        </td>
                                        <td>{ displayTime }</td>
                                        <td>{ (fastestLap !== null && fastestLap.CarIdx === d.carIndex) ? (
                                            <BsFillStopwatchFill className = "ml-1" />
                                        ) : ""}</td>
                                    </tr>
                                )
                            })}
                        </table>
                    </div>
                </div>
			</div>
		</div>
    )
}

export default TrackOverlay;