import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

import socketIOClient from 'socket.io-client';
import './App.css';


function App() {
	const socketFlight = useRef();
	const socketChat = useRef();

	const [flights, setFlights] = useState([]);
	const [positions, setPositions] = useState({});
	const [path, setPath] = useState({});

	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');
	const [nickname, setNickname] = useState('');

	function sendMessage() {
		const msg = {
			name: nickname ? nickname : 'Anonymous',
			date: Date.now(),
			message: message,
		}
		socketChat.current.emit('CHAT', msg, (error, message) => {
			console.log(error);
			console.log(message);
		});
		setMessage('');
	}

	function actualize() {
		socketFlight.current.emit('FLIGHTS', {});
	}

	// Chat
	useEffect(() => {
		socketChat.current = socketIOClient('wss://tarea-3-websocket.2021-1.tallerdeintegracion.cl', {
			path: '/flights',
			transports: ['websocket'],
		});

		socketChat.current.on('CHAT', (data) => {
			setMessages((current) => [...current, data]);
		});

		return () => socketChat.current.disconnect();
	}, []);

	// Vuelos
	useEffect(() => {
		socketFlight.current = socketIOClient('wss://tarea-3-websocket.2021-1.tallerdeintegracion.cl', {
			path: '/flights',
			transports: ['websocket'],
		});
		socketFlight.current.on('FLIGHTS', (data) => {
		  setFlights([...data]);
		});
		socketFlight.current.on('POSITION', (data) => {
			setPositions((current) => {
			const flights = { ...current };
			flights[data.code] = data.position;
			return flights;
			});
			setPath((current) => {
			const flights = { ...current };
			flights[data.code] = current[data.code] ? [...current[data.code], data.position] : [data.position];
			return { ...flights };
			}); 
		});
		return () => socketFlight.current.disconnect();
	}, []);

	return (
		<div>
		<MapContainer className="map" center={[-32, -68]} zoom={5} scrollWheelZoom={false}>
			<TileLayer
			attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{Object.keys(positions).map((key, index) => (
				<Marker key={key} position={positions[key]}>
					<Popup>
						Código: {key}
					</Popup>
				</Marker>
			))}
			{Object.keys(path).map((key, index) => (
				<Polyline
					key={key}
					positions={path[key]}
				/>
			))}
			{flights.map((flight, key) => (
				<Polyline
					key={key}
					positions={[flight.origin, flight.destination]}
				/>
			))}
		</MapContainer>
		<div className="info">
			<button onClick={actualize}>
				Obtener Info
			</button>
			{flights.map((flight, index) => (
				<div className="flight">
					<h3>code:</h3>
					<p>{flight.code}</p>

					<h3>airline:</h3>
					<p>{flight.airline}</p>

					<h3>origin:</h3>
					<p>({flight.origin[0]}, {flight.origin[1]})</p>

					<h3>destination:</h3>
					<p>({flight.destination[0]}, {flight.destination[1]})</p>

					<h3>plane:</h3>
					<p>{flight.plane}</p>

					<h3>seats:</h3>
					<p>{flight.seats}</p>

					<h3>passengers:</h3>
					<ul>
						{flight.passengers.map((passenger, _) => (
							<li>{passenger.name}, {passenger.age}</li>
						))}
					</ul>
				</div>
			))}
		</div>
		<div className="chat">
			<div className="messages">
				{messages.map((message, index) => (
					<p>
						{message.name}: {message.message} ({new Date(message.date).toLocaleString()})
					</p>
				))}
			</div>
			<textarea
				value={nickname}
				onChange={(e) => setNickname(e.target.value)}
				placeholder="Nickname"
			/>
			<textarea
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				placeholder="Message"
			/>
			<button onClick={sendMessage}>
				Enviar
			</button>
		</div>
	  </div>
	);
}

export default App;
