import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import MapScreen from './screens/MapScreen';

export default function App() {
  useEffect(() => {
    // Set dark status bar
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setBackgroundColor('#000000');
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />
      <MapScreen />
    </>
  );
}
