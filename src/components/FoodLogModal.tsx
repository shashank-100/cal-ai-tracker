import { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import { ApiError } from '../lib/api';
import type { FoodAnalysisResult } from '../lib/types';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
type MealType = typeof MEAL_TYPES[number];

interface Props {
  visible: boolean;
  onClose: () => void;
  onLogged: () => void;
}

type Step = 'pick' | 'analyzing' | 'confirm' | 'saving';

export default function FoodLogModal({ visible, onClose, onLogged }: Props) {
  const { token } = useAuthStore();
  const [step, setStep] = useState<Step>('pick');
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [servingQty, setServingQty] = useState(1);

  const reset = () => {
    setStep('pick');
    setResult(null);
    setImageUri(null);
    setMealType('lunch');
    setServingQty(1);
  };

  const handleClose = () => { reset(); onClose(); };

  const pickAndAnalyze = async (source: 'camera' | 'library') => {
    if (!token) return;

    const perm = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert('Permission required', `Please allow ${source} access in Settings.`);
      return;
    }

    const picked = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.7, allowsEditing: true, aspect: [4, 3] })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.7, allowsEditing: true, aspect: [4, 3] });

    if (picked.canceled || !picked.assets[0]) return;

    const uri = picked.assets[0].uri;
    setImageUri(uri);
    setStep('analyzing');

    try {
      const analysis = await api.foodAnalysis.analyze(token, uri, mealType);
      setResult(analysis);
      setStep('confirm');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Analysis failed. Please try again.';
      Alert.alert('Error', msg, [{ text: 'OK', onPress: reset }]);
    }
  };

  const logFood = async () => {
    if (!result || !token) return;
    setStep('saving');
    const today = new Date().toISOString().split('T')[0];
    try {
      await api.foodLogs.create(token, {
        log_date: today,
        meal_type: mealType,
        food_name: result.name,
        calories: Math.round(result.calories * servingQty),
        protein_g: Math.round(result.protein_g * servingQty),
        carbs_g: Math.round(result.carbs_g * servingQty),
        fat_g: Math.round(result.fat_g * servingQty),
        serving_qty: servingQty,
        serving_unit: result.serving_unit,
        photo_url: result.photo_url,
        ai_confidence: result.confidence,
      });
      reset();
      onLogged();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save. Please try again.';
      Alert.alert('Error', msg);
      setStep('confirm');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {step === 'pick' ? 'Log Food' :
             step === 'analyzing' ? 'Analyzing...' :
             step === 'confirm' ? 'Confirm' : 'Saving...'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {step === 'pick' && (
          <View style={styles.body}>
            <Text style={styles.mealLabel}>Meal type</Text>
            <View style={styles.mealRow}>
              {MEAL_TYPES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.mealChip, mealType === m && styles.mealChipActive]}
                  onPress={() => setMealType(m)}
                >
                  <Text style={[styles.mealChipText, mealType === m && styles.mealChipTextActive]}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.pickBtns}>
              <TouchableOpacity style={styles.pickBtn} onPress={() => pickAndAnalyze('camera')}>
                <Text style={styles.pickIcon}>📷</Text>
                <Text style={styles.pickBtnText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pickBtn, styles.pickBtnSecondary]} onPress={() => pickAndAnalyze('library')}>
                <Text style={styles.pickIcon}>🖼️</Text>
                <Text style={[styles.pickBtnText, styles.pickBtnTextSecondary]}>Choose from Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'analyzing' && (
          <View style={styles.loadingBody}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Identifying your food...</Text>
            <Text style={styles.loadingSubtext}>This takes a few seconds</Text>
          </View>
        )}

        {(step === 'confirm' || step === 'saving') && result && (
          <ScrollView style={styles.confirmScroll} contentContainerStyle={styles.confirmBody}>
            <View style={styles.resultCard}>
              <Text style={styles.foodName}>{result.name}</Text>
              <View style={styles.calRow}>
                <Text style={styles.calNum}>{Math.round(result.calories * servingQty)}</Text>
                <Text style={styles.calLabel}>kcal</Text>
              </View>
              <Text style={styles.confidence}>
                {Math.round(result.confidence * 100)}% confident
              </Text>
            </View>

            <View style={styles.macroGrid}>
              <View style={styles.macroItem}>
                <Text style={styles.macroVal}>{Math.round(result.protein_g * servingQty)}g</Text>
                <Text style={styles.macroKey}>Protein</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroVal}>{Math.round(result.carbs_g * servingQty)}g</Text>
                <Text style={styles.macroKey}>Carbs</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroVal}>{Math.round(result.fat_g * servingQty)}g</Text>
                <Text style={styles.macroKey}>Fat</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroVal}>{Math.round(result.fiber_g * servingQty)}g</Text>
                <Text style={styles.macroKey}>Fiber</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Meal type</Text>
            <View style={styles.mealRow}>
              {MEAL_TYPES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.mealChip, mealType === m && styles.mealChipActive]}
                  onPress={() => setMealType(m)}
                  disabled={step === 'saving'}
                >
                  <Text style={[styles.mealChipText, mealType === m && styles.mealChipTextActive]}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Servings</Text>
            <View style={styles.servingRow}>
              <TouchableOpacity
                style={styles.servingBtn}
                onPress={() => setServingQty((s) => Math.max(0.5, s - 0.5))}
                disabled={step === 'saving'}
              >
                <Text style={styles.servingBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.servingNum}>{servingQty}</Text>
              <TouchableOpacity
                style={styles.servingBtn}
                onPress={() => setServingQty((s) => s + 0.5)}
                disabled={step === 'saving'}
              >
                <Text style={styles.servingBtnText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.servingUnit}>{result.serving_unit}</Text>
            </View>

            {result.items.length > 1 && (
              <>
                <Text style={styles.sectionLabel}>Items detected</Text>
                {result.items.map((item, i) => (
                  <View key={i} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCal}>{item.calories} kcal</Text>
                  </View>
                ))}
              </>
            )}

            <TouchableOpacity
              style={[styles.logBtn, step === 'saving' && styles.logBtnDisabled]}
              onPress={logFood}
              disabled={step === 'saving'}
            >
              {step === 'saving'
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.logBtnText}>Log This Meal</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.retakeBtn} onPress={reset} disabled={step === 'saving'}>
              <Text style={styles.retakeBtnText}>Retake Photo</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 18, color: '#666' },
  title: { fontSize: 17, fontWeight: '700', color: '#000' },
  body: { flex: 1, padding: 24 },
  mealLabel: { fontSize: 13, color: '#888', marginBottom: 10 },
  sectionLabel: { fontSize: 13, color: '#888', marginBottom: 10, marginTop: 20 },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  mealChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#e0e0e0',
  },
  mealChipActive: { backgroundColor: '#000', borderColor: '#000' },
  mealChipText: { fontSize: 14, color: '#666' },
  mealChipTextActive: { color: '#fff', fontWeight: '600' },
  pickBtns: { flex: 1, justifyContent: 'center', gap: 14 },
  pickBtn: {
    backgroundColor: '#000', borderRadius: 16, paddingVertical: 20,
    alignItems: 'center', gap: 8,
  },
  pickBtnSecondary: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e0e0e0' },
  pickIcon: { fontSize: 28 },
  pickBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  pickBtnTextSecondary: { color: '#000' },
  loadingBody: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 18, fontWeight: '600', color: '#000' },
  loadingSubtext: { fontSize: 14, color: '#888' },
  confirmScroll: { flex: 1 },
  confirmBody: { padding: 20, paddingBottom: 40 },
  resultCard: {
    backgroundColor: '#f8f8f8', borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 16,
  },
  foodName: { fontSize: 22, fontWeight: '700', color: '#000', textAlign: 'center', marginBottom: 8 },
  calRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  calNum: { fontSize: 48, fontWeight: '800', color: '#000' },
  calLabel: { fontSize: 18, color: '#888' },
  confidence: { fontSize: 13, color: '#aaa', marginTop: 6 },
  macroGrid: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  macroItem: {
    flex: 1, backgroundColor: '#f8f8f8', borderRadius: 14,
    padding: 14, alignItems: 'center',
  },
  macroVal: { fontSize: 18, fontWeight: '700', color: '#000' },
  macroKey: { fontSize: 11, color: '#888', marginTop: 2 },
  servingRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  servingBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center',
  },
  servingBtnText: { fontSize: 22, fontWeight: '300', color: '#000', lineHeight: 26 },
  servingNum: { fontSize: 22, fontWeight: '700', color: '#000', minWidth: 32, textAlign: 'center' },
  servingUnit: { fontSize: 14, color: '#888' },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  itemName: { fontSize: 14, color: '#333' },
  itemCal: { fontSize: 14, fontWeight: '600', color: '#000' },
  logBtn: {
    backgroundColor: '#000', borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginTop: 28,
  },
  logBtnDisabled: { backgroundColor: '#666' },
  logBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  retakeBtn: { alignItems: 'center', paddingVertical: 14 },
  retakeBtnText: { fontSize: 15, color: '#888', textDecorationLine: 'underline' },
});
