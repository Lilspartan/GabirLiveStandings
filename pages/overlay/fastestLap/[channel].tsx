import { useState, useEffect } from 'react';
import { Driver, FastestLap } from '../../../utils/interfaces';
import classnames from 'classnames';
import io from 'socket.io-client';
import { BsFillStopwatchFill } from 'react-icons/bs';
import { useRouter } from 'next/router'

let socket;

export default function Home() {
	const [loading, setLoading] = useState(true);
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

	const [fastestLap, setFastestLap] = useState<FastestLap | null>({
        CarIdx: 0,
        FastestLap: 1,
        FastestTime: 16.6061
    });
    const [fastestDriver, setFastestDriver] = useState<Driver>({ 
        carIndex: 0, 
        name: "Gabe Krahulik", 
        userID: 0, 
        carNumber: "904", 
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
    });
    const [open, setOpen] = useState(false);

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

        socket.on(`standings_update-${router.query.channel}`, (data) => {
			let newDrivers = [];
			let parsed = JSON.parse(data)
			
			parsed.sessionRacers.forEach(d => {
				if (d.raceData.position !== 0) newDrivers.push(d);
			})

			if (newDrivers.length) setDrivers(newDrivers);
		})
        
		socket.on(`fastest_lap-${router.query.channel}`, (data) => {
            let parsed = data;
            console.log(data)
            if (parsed.fastestLap !== null && parsed.driver !== null) {
				setFastestLap(parsed.fastestLap[0]);
                setFastestDriver(parsed.driver);
                setOpen(true);
                setTimeout(() => {
                    setOpen(false);
                }, 5000)
			}
		})
	}

    useEffect(() => {
		if (router.query.channel === undefined) return;
		
		console.log(router.query.channel)

		socketInitializer();
	}, [router.query.channel])

	return (
		<>
            <div className = {`h-auto flex flex-row justify-center`}>
				<div className = {`bg-[#222222cc] text-white px-8 py-4 rounded-lg flex flex-col transition duration-500 mt-4 grow-0 ${open ? "translate-y-0" : "-translate-y-96"}`}>
                    <div className = "mr-6 flex flex-row justify-center text-center w-full">
                        <div><h1 className = "font-extrabold text-3xl inline align-top">FASTEST LAP</h1></div>
                        <div><BsFillStopwatchFill className = "inline text-purple-600 ml-4 text-4xl" /></div>
                    </div>
                    <hr className = "m-4" />
                    <div>
                        <h2 className = "font-bold text-xl">#{ fastestDriver.carNumber } { fastestDriver.name } - { fastestLap.FastestTime.toFixed(3) }</h2>
                    </div>
                    {/* <div className = "flex flex-row justify-center mt-6">
                        <h1 className = "text-xl font-bold mr-2">POWERED BY </h1>
                        <div className = "">
                            <img src="https://i.gabirmotors.com/assets/other/pride/GM%20Pride4.png" alt="" className = "h-8"/> 
                        </div>
                    </div> */}
                </div>
			</div>
		</>
	)
}