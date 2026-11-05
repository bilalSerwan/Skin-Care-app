import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';

// Please replace this with your actual Gemini API key, or use environment variables in a real project
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const SYSTEM_INSTRUCTION = `You are an advanced, empathetic AI Dermatological and Skin Health Assistant. Your purpose is to analyze images of skin conditions alongside user-provided symptoms.

CRITICAL DIRECTIVES:
1. You are an educational tool, not a doctor. Never provide a definitive medical diagnosis.
2. The user may speak in Kurdish or English. You must understand their input, but you MUST return your response in the exact JSON structure provided below.
3. Translate the final output text into the language the user used in their prompt.

INPUT:
You will receive an image of skin and a text description from the user.

OUTPUT FORMAT:
You must respond ONLY with a valid JSON object matching this exact structure. Do not include markdown formatting or extra text outside the JSON.

{
  "visual_observations": "A brief, sympathetic description of what is visible in the image (e.g., 'I can see some redness and raised bumps on the cheeks...').",
  "potential_matches": [
    {
      "condition_name": "Name of the condition",
      "reasoning": "Why this matches the image and their text."
    }
  ],
  "care_suggestions": [
    "Practical step 1 (e.g., 'Use a gentle, fragrance-free cleanser')",
    "Practical step 2 (e.g., 'Avoid ingredients like alcohol or physical scrubs')"
  ],
  "ingredients_to_look_for": ["Salicylic Acid", "Niacinamide"],
  "urgency_level": "Low | Medium | High",
  "medical_disclaimer": "This is an informational analysis based on visual patterns. Please consult a dermatologist or doctor for an accurate diagnosis and treatment plan, especially if symptoms worsen."
}`;

interface AIResponse {
  visual_observations: string;
  potential_matches: { condition_name: string; reasoning: string }[];
  care_suggestions: string[];
  ingredients_to_look_for: string[];
  urgency_level: "Low" | "Medium" | "High" | string;
  medical_disclaimer: string;
}

export default function ResultsScreen() {
  const { imageUri, symptoms } = useLocalSearchParams<{ imageUri: string, symptoms: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AIResponse | null>(null);

  useEffect(() => {
    const analyzeImage = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!imageUri || !symptoms) {
          throw new Error("Missing image or symptoms data.");
        }

        if (!GEMINI_API_KEY) {
          throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY. Add it to your .env file and restart Expo.");
        }

        // Read the image file into base64 right before sending
        const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });

        // Prepare payload for Gemini 2.5 Flash using strict camelCase required by the REST API
        const payload = {
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
          },
          contents: [
            {
              parts: [
                { text: `User Symptoms: ${symptoms}` },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`API Request Failed: ${response.status} - ${errText}`);
        }

        const result = await response.json();
        let textResponse = result.candidates[0].content.parts[0].text;

        // Strip markdown if the AI hallucinated it
        if (textResponse.startsWith('```json')) {
          textResponse = textResponse.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (textResponse.startsWith('```')) {
          textResponse = textResponse.replace(/^```/, '').replace(/```$/, '').trim();
        }

        // Parse the enforced JSON response
        const parsedData = JSON.parse(textResponse) as AIResponse;
        setData(parsedData);

      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred during analysis.");
      } finally {
        setLoading(false);
      }
    };

    analyzeImage();
  }, [imageUri, symptoms]);

  const getUrgencyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return '#EF4444'; // Red
      case 'medium': return '#F59E0B'; // Amber
      case 'low': return '#10B981'; // Green
      default: return '#64748B'; // Slate
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.loadingText}>Analyzing your skin health...</Text>
        <Text style={styles.loadingSubtext}>Our AI is carefully reviewing the image and your symptoms.</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>Analysis Failed</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <Text style={styles.errorSubtext}>Please ensure EXPO_PUBLIC_GEMINI_API_KEY is set to a valid key in your .env file.</Text>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Urgency Banner */}
        <View style={[styles.banner, { backgroundColor: getUrgencyColor(data.urgency_level) + '15', borderColor: getUrgencyColor(data.urgency_level) }]}>
          <Text style={[styles.bannerTitle, { color: getUrgencyColor(data.urgency_level) }]}>
            Urgency: {data.urgency_level}
          </Text>
        </View>

        {/* Visual Observations */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Observations</Text>
          <Text style={styles.cardText}>{data.visual_observations}</Text>
        </View>

        {/* Potential Matches */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Potential Matches</Text>
          {data.potential_matches.map((match, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.itemTitle}>{match.condition_name}</Text>
              <Text style={styles.itemText}>{match.reasoning}</Text>
            </View>
          ))}
        </View>

        {/* Care Suggestions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Care Suggestions</Text>
          {data.care_suggestions.map((suggestion, index) => (
            <View key={index} style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{suggestion}</Text>
            </View>
          ))}
        </View>

        {/* Ingredients to Look For */}
        {data.ingredients_to_look_for && data.ingredients_to_look_for.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Beneficial Ingredients</Text>
            <View style={styles.tagsContainer}>
              {data.ingredients_to_look_for.map((ingredient, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Medical Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerTitle}>⚠️ Medical Disclaimer</Text>
          <Text style={styles.disclaimerText}>{data.medical_disclaimer}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  listItem: {
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0EA5E9',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0EA5E9',
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#0369A1',
    fontWeight: '500',
    fontSize: 13,
  },
  disclaimerContainer: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 8,
  },
  disclaimerTitle: {
    color: '#B91C1C',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
  },
  disclaimerText: {
    color: '#991B1B',
    fontSize: 13,
    lineHeight: 18,
  },
});