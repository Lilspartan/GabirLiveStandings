import { useState, useEffect } from 'react';
import { DriverData } from '../../../utils/interfaces';
import io from 'socket.io-client';
import { useRouter } from 'next/router';

let socket;

const TrackOverlay = () => {
    const [driverData, setDriverData] = useState<DriverData>(null);
    const [lights, setLights] = useState(0);
    const [lightStates, setLightStates] = useState(null);

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

			setDriverData(parsed.driverData);
		})
	}

    useEffect(() => {
        if (driverData && driverData.driver) {
            var RPM = Math.floor(driverData.driver.carData.rpm)
            var LightInterval = (driverData.shiftRPM - driverData.firstRPM) / 10;

            if (RPM > driverData.firstRPM) setLights(Math.floor(10 - ((driverData.shiftRPM - RPM) / LightInterval)));
            else setLights(1);

            var l = [];

            for (var i = 1; i < lights + 1; i ++) {
                l[i - 1] = true;
            }
            
            for (var i = lights + 1; i <= 10; i ++) {
                l[i - 1] = false;
            }

            setLightStates(l);

            console.log(lightStates);
        }
    }, [driverData])

	useEffect(() => {
		if (router.query.channel === undefined) return;
		
		console.log(router.query.channel)

		socketInitializer();
	}, [router.query.channel])

    return (
		<div className = "h-auto flex flex-row justify-start">
			{lightStates && lightStates.map((light, index) => (
                <img className = "light" src={`https://i.gabirmotors.com/assets/other/christmas/lights/lights${light ? "4" : "1"}.png`} alt="" />
            ))}
		</div>
    )
}

export default TrackOverlay;