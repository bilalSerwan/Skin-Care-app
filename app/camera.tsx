import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import FaceDetection from '@react-native-ml-kit/face-detection';

export default function CameraScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: 'face' | 'body' }>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.message}>We need your permission to show the camera</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true });

      if (!photo) throw new Error("Failed to capture photo");

      let finalUri = photo.uri;

      // Only perform Face Detection & Cropping if the mode is 'face'
      if (type === 'face' && photo.uri) {
        try {
          const faces = await FaceDetection.detect(photo.uri);

          if (faces.length > 0) {
            // Get the largest face bounding box
            const face = faces.reduce((prev, current) => {
              return (prev.frame.width * prev.frame.height > current.frame.width * current.frame.height) ? prev : current;
            });

            // Add some padding to the crop
            const padding = face.frame.width * 0.2;
            const cropX = Math.max(0, face.frame.left - padding);
            const cropY = Math.max(0, face.frame.top - padding);
            const cropWidth = Math.min(photo.width - cropX, face.frame.width + (padding * 2));
            const cropHeight = Math.min(photo.height - cropY, face.frame.height + (padding * 2));

            // Crop the image using expo-image-manipulator
            const manipResult = await ImageManipulator.manipulateAsync(
              photo.uri,
              [{
                crop: {
                  originX: cropX,
                  originY: cropY,
                  width: cropWidth,
                  height: cropHeight,
                }
              }],
              { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
            );

            if (manipResult.uri) {
              finalUri = manipResult.uri;
            }
          }
        } catch (error) {
          console.error("Face detection failed, proceeding with original image", error);
        }
      }

      // Navigate to the form screen, passing only the uri to prevent URL length limit crashes
      router.push({
        pathname: '/form',
        params: {
          imageUri: finalUri,
        }
      });

    } catch (error) {
      console.error("Failed to take picture:", error);
      alert("Failed to capture image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        ref={cameraRef}
      >
        <SafeAreaView style={styles.uiContainer}>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {type === 'face' ? "Position your face in the center" : "Position the area in the center"}
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#0EA5E9" size="large" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  uiContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 30,
    alignItems: 'center',
    paddingBottom: 50,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});