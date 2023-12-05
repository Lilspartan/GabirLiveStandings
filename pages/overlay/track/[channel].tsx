import { useState, useEffect } from 'react';
import { Session } from '../../../utils/interfaces';
import classnames from 'classnames';
import io from 'socket.io-client';
import trackmaps from '../../../public/trackmaps.json';
import { useRouter } from 'next/router'

let socket;

const TrackOverlay = () => {
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
			let parsed = JSON.parse(data)

			setSession(parsed.sessionInfo)
		})
	}

	useEffect(() => {
		if (router.query.channel === undefined) return;
		
		console.log(router.query.channel)

		socketInitializer();
	}, [router.query.channel])

    return (
		<div className = {`h-auto flex flex-row justify-end`}>
			<div className = {`bg-[#222222cc] text-white px-8 py-4 rounded-lg flex flex-col transition duration-500 mt-4 mr-4`}>
				<h1 className = "font-extrabold text-3xl text-center">{ session.track.name }</h1>
				<h2 className = "text-center font-bold text-xl">{ session.track.city }, { session.track.country }</h2>
				<h3 className = "mt-4 text-xl text-center font-bold mb-1">https://pitwall.gabirmotors.com</h3>
				{/* <img src={`${trackmaps[session.track.id]}active.svg`} className = "inline" /> */}
			</div>
		</div>
    )
}

export default TrackOverlay;