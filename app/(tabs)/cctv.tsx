// CctvLiveScreen.tsx
import React, { useRef, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useColorScheme } from 'nativewind';
import colors from '../../constants/colors';

const { width } = Dimensions.get('window');

interface CctvPole {
  id: string;
  name: string;
  coords: [number, number];
  streamUrl: string;
}

export default function CctvLiveScreen() {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const webviewRef = useRef(null);
  const [selectedPole, setSelectedPole] = useState<CctvPole | null>(null);

  const currentStreamUrl = selectedPole?.streamUrl || '';

  const onWebViewMessage = (event: WebViewMessageEvent) => {
  console.log('📩 Message diterima dari WebView:', event.nativeEvent.data); // 🟢 Tambahkan baris ini

  try {
    const poleData: CctvPole = JSON.parse(event.nativeEvent.data);
    console.log('✅ Parsed CCTV data:', poleData);
    setSelectedPole(poleData);
  } catch (error) {
    console.error('❌ Gagal parse WebView message:', error);
  }
};


  const player = useVideoPlayer(currentStreamUrl, (player) => {
    player.loop = true;
    if (currentStreamUrl) player.play();
  });

  return (
    <SafeAreaView
      className={`flex-1 ${isDarkMode ? 'bg-darkBackground' : 'bg-white'}`}
    >
      {/* 🌍 PETA */}
      <View
        className="rounded-lg overflow-hidden"
        style={{ height: '30%', width: '100%' }}
      >
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={require('../../assets/html/leaflet_map.html')}
          onMessage={onWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          style={{ flex: 1 }}
        />
      </View>

      {/* 📹 VIDEO */}
      <View className="p-4 flex-1">
        <Text className="text-xl font-bold mb-2">Rekaman Live CCTV</Text>
        <Text className="text-sm mb-4">
          Pantau rekaman live kamera CCTV secara realtime.
        </Text>

        <View className="mb-4">
          {selectedPole ? (
            <>
              <Text className="text-base font-semibold">{selectedPole.name}</Text>
              <Text className="text-sm text-gray-500">
                Lat: {selectedPole.coords[0]} Long: {selectedPole.coords[1]}
              </Text>
            </>
          ) : (
            <Text className="text-base text-gray-500">
              Pilih titik CCTV dari peta.
            </Text>
          )}
        </View>

        {selectedPole?.streamUrl ? (
          <View
            className="w-full bg-black items-center justify-center rounded-lg overflow-hidden"
            style={{ height: width * (9 / 16) }}
          >
            <VideoView
              player={player}
              className="flex-1 w-full"
              allowsFullscreen
              allowsPictureInPicture
              style={{ width: '100%', height: '100%' }}
            />
          </View>
        ) : (
          <View
            className="w-full bg-black rounded-lg items-center justify-center"
            style={{ height: width * (9 / 16) }}
          >
            <Text className="text-white">Pilih CCTV dari peta.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
