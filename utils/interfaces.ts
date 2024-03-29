import { MouseEventHandler } from 'react';

export interface RaceData {
	position:         number;
	onPitRoad:        boolean;
	class:            number;
	f2Time:           number;
	lap:              number;
	lapsCompleted:    number;
	fastRepairsUsed:  number;
	lapPercent:       number;
}

export interface CarData {
	trackSurface:  TrackSurface;
	steer:         number;
	rpm:           number;
	gear:          number;
}

export interface Driver {
    carIndex: number;
    name: string;
    userID: number;
    carNumber: string;
    isPaceCar: boolean;
    raceData: RaceData;
    carData: CarData;
    lapTimes: LapTimes;
    flags: Flag[];
    qualifyingResult: QualifyingResult | null;
    class: CarClass;
    teamName: string;
	license: DriverLicense | null;
    isSpectator: boolean;
    isAI: boolean;
    estTimeIntoLap: number;
}

export interface LapData {
    lapNumber: number;
    fuelAtStartPct: number;
    fuelAtStartLiters: number;
    fuelUsedPct: number;
    fuelUsedLiters: number;
    lapTime: number;
    sessionType: SessionType;
}

export interface DriverLicense {
    iRating: number;
    licenseLevel: number;
    licenseSubLevel: number;
    licenseName: string;
    licenseColor: string | null;
}

export interface CarClass {
    id: number;
    car: string;
    color: string;
}

export interface LapTimes {
	last:     number;
	best: {
		time:   number;
		lap:    number;
	}
}

export interface QualifyingResult {
	position: number;
	classPosition: number;
	fastestLap: number;
	fastestTime: number;
}

export interface Session {
    flags: Flag[],
	isPALeagueRace: boolean,
	focusedCarIndex: number,
    session: {
        number: number,
        type: SessionType,
        timeRemaining: number,
		fastRepairs: number | string,
		fastestLap: FastestLap[] | null
    },
	track: {
		name: string,
		id: number,
		city: string,
		country: string,  
		temperature: string,
		length: string;
	  },
	  weather: {
		  windSpeed: string,
		  temperature: string,
		  skies: string
	  }
}

export interface FastestLap {
	CarIdx: number;
	FastestLap: number;
	FastestTime: number;
}

export type SessionType = 
	"PRACTICE" |
	"QUALIFY" |
	"RACE" |
	"LOADING"

export type Flag = 
	"OneLapToGreen" | 
	"StartReady" |
	"Caution" |
	"StartHidden" |
	"Checkered" | 
	"Green" |
	"GreenHeld" |
	"CautionWaving" |
	"White" |
	"Servicible" |
	"StartSet" |
	"StartGo" |
	"Disqualify" |
	"Furled" |
	"Black" |
	string

export type TrackSurface =
	"OnTrack" |
	"OffTrack" |
	"AproachingPits" | 
	"InPitStall" |
	"NotInWorld" |
	string

export type Connection = 
	"disconnected" |
	"connected" |
	"connecting"

	export interface DriverData {
		tiresRemaining: {
			left: {
				front: number;
				rear: number;
			};
			right: {
				front: number;
				rear: number;
			};
		};
		fuel: {
			remaining: number;
			percent: number;
		};
		carIndex: number;
		driver: Driver | null;
		laps: LapData[];
		firstRPM: number;
		shiftRPM: number;
	}

export interface DismissedCard {
	id: string;
	reopen: MouseEventHandler;
	name: string;
}

export interface Options {
	channel: string;
	fuelIsPublic: boolean;
	password: string;
	profile_icon: string;
	charity?: CharityOptions | null;
}

export interface CharityOptions {
	link: string;
	description: string | null;
	name: string;
	callToAction: string;
}

export type StandingsFeature = 
	"FLAGS" |
	"QUALIFYINGPOSITIONS" |
	"CLASSCOLORS" |
	"STOPWATCHICON" |
	"FOCUSEDDRIVER" |
	"HIGHLIGHTEDDRIVER";

export type UserTag =
	"early" |
	"beta_tester" |
	"vip";

export interface Theme {
	theme: string;
	backgroundImage: string;
	backgroundColor: string;
	useMetric: boolean;
	showTwitch: boolean;
	hideStandingsFeatures: StandingsFeature[];
	teamNames: boolean;
}