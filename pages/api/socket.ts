import { Server } from 'socket.io';

const channelTags = {
	"keyma5ter": {
		"tags": [
			"beta_tester",
			"early"
		]
	},
	"GargosTheMighty": {
		"tags": [
			"beta_tester",
			"early"
		]
	},
	"SwettPants": {
		"tags": [
			"beta_tester",
			"early"
		]
	},
	"VeeveeVonVore": {
		"tags": [
			"beta_tester",
			"early"
		]
	},
	"DuckSoup": {
		"tags": [
			"beta_tester",
			"early"
		]
	},
	"Skiggity242": {
		"tags": [
			"vip",
			"beta_tester",
			"early"
		]
	},
	"LilSpartan04": {
		"tags": [
			"vip",
			"beta_tester",
			"early"
		]
	},
	"PennyArcade": {
		"tags": [
			"vip",
			"beta_tester",
			"early"
		]
	},
	"mattcribbsracing": {
		"tags": [
			"vip",
			"early"
		]
	},
	"BioRebel": {
		"tags": [
			"early"
		]
	},
	"hoekenheef": {
		"tags": [
			"early"
		]
	}
}
let channels = [];

const SocketHandler = (req, res) => {
    if (res.socket.server.io) {
        console.log('Socket already runnning');
        return res.end();
    } else {
        console.log("Initializing socket");
        const io = new Server(res.socket.server);
        res.socket.server.io = io;

        io.on('connection', socket => {
            socket.on("standings", data => {
                let r = JSON.parse(data);
                let index = -1;
                
                // find the user in the array of users
                for (let i = 0; i < channels.length; i++) {
                    if (channels[i].name === r.options.channel) {
                        index = i;
                    }
                }
        
                // if the user has not finished connecting yet, do nothing
                if (index === -1) return;
        
                // set the new data
                channels[index].drivers = r.sessionRacers;
                channels[index].session = r.sessionInfo;
                channels[index].driverData = r.driverData;
                channels[index].fuelIsPublic = r.options.fuelIsPublic;
                channels[index].password = r.options.password;
                channels[index].profile_icon = r.options.profile_icon;
        
                // logic for firing the new fastest lap event
                try {
                    // check if there is a fastest lap yet
                    if (channels[index].fastestLap === null) {
                        // set the fastest lap
                        channels[index].fastestLap = r.sessionInfo.session.fastestLap;
                        // check if the fastest lap is a placeholder or an actual racer (placeholder will be index 255)
                        if (channels[index].fastestLap.CarIdx !== 255) {
                            // find the data for the driver with the given index
                            for (let i in channels[index].drivers) {
                                // set the fastest driver data to be the driver with the fastest driver's index
                                if (channels[index].drivers[i].carIndex === channels[index].fastestLap[0].CarIdx) {
                                    channels[index].fastestDriver = { ...channels[index].drivers[i] }
                                }
                            }
                        }
                        // emit the fastest lap event for the current user
                        io.emit(`fastest_lap-${channels[index].name}`, {
                            fastestLap: channels[index].fastestLap, driver: channels[index].fastestDriver
                        });
                        // If there is already a fastest lap, check if it is the same as the new one
                    } else if (channels[index].fastestLap[0].CarIdx != r.sessionInfo.session.fastestLap[0].CarIdx) {
                        // add it to the user's data
                        channels[index].fastestLap = r.sessionInfo.session.fastestLap;
                        // check if it's a placeholder
                        if (channels[index].fastestLap.CarIdx !== 255) {
                            // find the driver
                            for (let i in channels[index].drivers) {
                                // set the data
                                if (channels[index].drivers[i].carIndex === channels[index].fastestLap[0].CarIdx) {
                                    channels[index].fastestDriver = { ...channels[index].drivers[i] }
                                }
                            }
                        }
                        // emit the event
                        io.emit(`fastest_lap-${channels[index].name}`, {
                            fastestLap: channels[index].fastestLap, driver: channels[index].fastestDriver
                        });
                    }
                } catch (e) {
                    console.error(e);
                }
        
                // find special tags for the user
                let checkingTags = channelTags[channels[index].name];
                if (checkingTags !== undefined) {
                    r.options.tags = checkingTags.tags;
                } else {
                    r.options.tags = null;
                }
        
                // send the data to the clients
                io.emit(`standings_update-${channels[index].name}`, JSON.stringify(r));
            })
        
            socket.on("awake", d => {
                let channelExists = false;
        
                if (d !== null) {
                    for (let i = 0; i < channels.length; i++) {
                        if (channels[i].name === d) {
                            channels[i].missedPings = 0;
                            channelExists = true;
                        }
                    }
        
                    if (!channelExists) {
                        let channelToAdd = {
                            name: d,
                            fuelIsPublic: false,
                            profile_icon: "none",
                            password: '',
                            missedPings: 0,
                            fastestLap: null,
                            fastestDriver: null,
                            drivers: null,
                            session: null,
                            driverData: null,
                        }
                        channels.push(channelToAdd);
                    }
                }
            })
        })
        return res.end();
    }
}

export default SocketHandler;