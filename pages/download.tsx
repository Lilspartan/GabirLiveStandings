import { useEffect } from 'react';
import { SEO } from '../components';

export default function Home() {
	useEffect(() => {
		window.location.href = "https://github.com/Lilspartan/Pit-Wall-Electron-Client/releases/latest";
	}, [])

	return (
		<>
            <SEO 
                title = "Pit Wall Client Download"
                url = "download"
                description = "Download the Pit Wall desktop app and start using the pit wall on your own streams today!"
            />
		</>
	)
}