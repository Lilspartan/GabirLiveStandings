import { useState, useEffect } from 'react';
import { Session, Driver } from '../../../utils/interfaces';
import classnames from 'classnames';
import io from 'socket.io-client';
import { useRouter } from 'next/router';
import secondsToFormatted from '../../../utils/secondsToFormatted';

let socket;

const TrackOverlay = () => {
    const [drivers, setDrivers] = useState<Driver[]>([{class: { car: "N/A", id: 0, color: "ffffff" }, teamName: "", carIndex: 0,name: "Waiting to Recieve Standings...",userID: 0,carNumber: "0",isPaceCar: false,raceData: {position: 1,onPitRoad: true,class: 0,f2Time: 0,lap: 1,lapsCompleted: 0,lapPercent: 0,fastRepairsUsed: 0,},carData: {trackSurface: "NotInWorld",steer: 0,rpm: 0,gear: 0},lapTimes: {last: 0,best: { time: 0, lap: 0 }},flags: [],qualifyingResult: null, isAI: false, isSpectator: false, estTimeIntoLap: 0, license: null }])
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
        focusedCarIndex: -1,
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

    const [sortedDrivers, setSortedDrivers] = useState<Driver[]>([]);
    const [indexOfHighlight, setIndexOfHighlight] = useState(0);
    const [highlightedDriver, setHighlightedDriver] = useState<Driver | null>(null);

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
				newDrivers.push(d);
			})
			
			if (newDrivers.length) setDrivers(newDrivers);
		})
	}

	useEffect(() => {
		setSortedDrivers(drivers.sort((a, b) => {
			return b.raceData.lapPercent - a.raceData.lapPercent
		}))

		for (let i = 0; i < sortedDrivers.length; i ++) {
			if (sortedDrivers[i].carIndex === session.focusedCarIndex) {
				setIndexOfHighlight(i);
				setHighlightedDriver(sortedDrivers[i]);
			}
		}
	}, [drivers, session])

	useEffect(() => {
		if (router.query.channel === undefined) return;
		
		console.log(router.query.channel)

		socketInitializer();
	}, [router.query.channel])

    return (
		<div className = "h-auto flex flex-row justify-start">
			<div className = {`bg-[#222222dd] text-white px-2 py-4 rounded-xl flex flex-col transition duration-500 mt-4 ml-4 shadow-2xl`}>
            	{highlightedDriver !== null ? (
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
                        {sortedDrivers.map((d, i) => {
                            if (Math.abs(i - indexOfHighlight) > 3) return;

                            return (
                                <tr className={classnames([
                                    "",
                                    (d.raceData.onPitRoad ? "opacity-50" : ""),
                                ])}>
                                    <td className="px-4">{d.raceData.position}</td>
                                    <td className={`text-center text-black p-1 rounded-md`} style = {{ backgroundColor: `#${d.class.color}` }}>#{d.carNumber}</td>
                                    <td className="pl-2 py-1">
                                        {d.name}
                                    </td>
                                    <td className = "pl-4">{ d.carIndex !== session.focusedCarIndex && secondsToFormatted(d.estTimeIntoLap - highlightedDriver.estTimeIntoLap) }</td>
                                </tr>
                            )
                        })}
                        


                    </tbody>
					</table>
				) : ""}
            </div>
		</div>
    )
}

export default TrackOverlay;