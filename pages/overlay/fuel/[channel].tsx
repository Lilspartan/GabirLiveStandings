import React, { useState, useEffect } from 'react';
import { Session, Driver, FastestLap } from '../../../utils/interfaces';
import classnames from 'classnames';
import io from 'socket.io-client';
import { useRouter } from 'next/router';
import secondsToFormatted from '../../../utils/secondsToFormatted';

let socket;

const FuelOverlay = () => {
    const [driverData, setDriverData] = useState<null>(null);
    const [fuelIsPublic, setFuelIsPublic] = useState(false);

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

            setDriverData(parsed.driverData);
            setFuelIsPublic(parsed.fuelIsPublic);
		})
	}

	useEffect(() => {
		if (router.query.channel === undefined) return;
		
		console.log(router.query.channel)

		socketInitializer();
	}, [router.query.channel])

    return (
		<div className = "h-auto flex flex-row justify-start">
			<div className = {`bg-[#222222dd] text-white px-2 py-4 rounded-xl flex flex-col transition duration-500 mt-4 ml-4 shadow-2xl`}>
            	{fuelIsPublic ? (
                    <div>
                        <h1 className = "font-bold">Fuel Data is Public</h1>
                    </div>
                ) : (
                    <div>
                        <h1 className = "font-bold">Fuel Data is Private</h1>
                    </div>
                )}
            </div>
		</div>
    )
}

export default FuelOverlay;