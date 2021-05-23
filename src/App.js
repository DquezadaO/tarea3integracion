import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import './App.css';

function App() {
  return (
  	<div id="main-map">
		<MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
		  <Marker position={[51.505, -0.09]}>
		  </Marker>
		</MapContainer>
    </div>
  );
}

export default App;
