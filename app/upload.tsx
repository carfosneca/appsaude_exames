import {
  View, Text, TouchableOpacity, ScrollView, Alert,
  ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { parseDocument } from '@/lib/parse-document';
import type { ParsedExam } from '@/lib/parse-document';

type UploadStep = 'idle' | 'uploading' | 'parsing' | 'review' | 'saving' | 'done' | 'error';

export default function UploadScreen() {
  const router = useRouter();
  const [step, setStep] = useState<UploadStep>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [parsedData, setParsedData] = useState<ParsedExam | null>(null);
  const [sourceUri, setSourceUri] = useState('');
  const [sourceType, setSourceType] = useState<'pdf' | 'photo'>('pdf');

  async function handlePickPDF() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      await startParsing(asset.uri, 'pdf', asset.name ?? 'exame.pdf');
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Erro ao selecionar PDF');
      setStep('error');
    }
  }

  async function handlePickImage(useCamera: boolean) {
    try {
      let result: ImagePicker.ImagePickerResult;
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({ quality: 0.9, base64: false });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({ quality: 0.9, base64: false, mediaTypes: 'images' });
      }
      if (result.canceled || !result.assets?.[0]) return;
      await startParsing(result.assets[0].uri, 'photo');
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Erro ao selecionar imagem');
      setStep('error');
    }
  }

  async function startParsing(uri: string, type: 'pdf' | 'photo', filename?: string) {
    setSourceUri(uri);
    setSourceType(type);
    setStep('parsing');
    try {
      const parsed = await parseDocument({ uri, type, filename });
      setParsedData(parsed);
      setStep('review');
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Falha ao ler o exame');
      setStep('error');
    }
  }

  async function handleSave() {
    if (!parsedData) return;
    setStep('saving');
    try {
      await parsedData.save();
      setStep('done');
      setTimeout(() => router.back(), 1200);
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Falha ao salvar');
      setStep('error');
    }
  }

  if (step === 'idle') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <View className="flex-1 px-5 pt-6">
          <Text className="text-gray-500 mb-8">Escolha como deseja importar o laudo:</Text>

          <TouchableOpacity
            onPress={handlePickPDF}
            className="bg-white rounded-3xl p-6 mb-4 border border-gray-100 flex-row items-center gap-4 active:opacity-80"
          >
            <Text className="text-4xl">📄</Text>
            <View>
              <Text className="text-base font-semibold text-gray-800">Escolher PDF</Text>
              <Text className="text-sm text-gray-400">Do armazenamento do dispositivo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handlePickImage(true)}
            className="bg-white rounded-3xl p-6 mb-4 border border-gray-100 flex-row items-center gap-4 active:opacity-80"
          >
            <Text className="text-4xl">📷</Text>
            <View>
              <Text className="text-base font-semibold text-gray-800">Tirar foto</Text>
              <Text className="text-sm text-gray-400">Fotografar laudo impresso</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handlePickImage(false)}
            className="bg-white rounded-3xl p-6 mb-4 border border-gray-100 flex-row items-center gap-4 active:opacity-80"
          >
            <Text className="text-4xl">🖼️</Text>
            <View>
              <Text className="text-base font-semibold text-gray-800">Da galeria</Text>
              <Text className="text-sm text-gray-400">Foto já tirada do laudo</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'parsing' || step === 'saving') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0694a2" />
        <Text className="mt-4 text-gray-600 font-medium">
          {step === 'parsing' ? 'Lendo exame com IA…' : 'Salvando…'}
        </Text>
        <Text className="mt-1 text-gray-400 text-sm">Isso pode levar alguns segundos</Text>
      </SafeAreaView>
    );
  }

  if (step === 'done') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-5xl mb-4">✅</Text>
        <Text className="text-gray-800 font-semibold text-lg">Exame salvo!</Text>
      </SafeAreaView>
    );
  }

  if (step === 'error') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-8">
        <Text className="text-5xl mb-4">❌</Text>
        <Text className="text-gray-800 font-semibold text-lg mb-2">Falha ao processar</Text>
        <Text className="text-gray-500 text-sm text-center mb-8">{errorMsg}</Text>
        <TouchableOpacity
          onPress={() => setStep('idle')}
          className="bg-primary-500 px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-semibold">Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (step === 'review' && parsedData) {
    const obs = parsedData.rawExtraction?.observations ?? [];
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 120 }}>
          <View className="bg-primary-50 rounded-2xl p-4 mb-5 border border-primary-100">
            <Text className="font-semibold text-primary-700">Revisão do exame extraído</Text>
            <Text className="text-primary-600 text-sm mt-1">Confirme os dados antes de salvar.</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
            <Row label="Laboratório" value={parsedData.rawExtraction?.laboratory ?? '—'} />
            <Row label="Data do exame" value={parsedData.rawExtraction?.exam_date ?? '—'} />
            <Row label="Paciente" value={parsedData.rawExtraction?.patient_name ?? '—'} />
            <Row label="Analitos encontrados" value={String(obs.length)} />
          </View>

          <Text className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
            Analitos ({obs.length})
          </Text>
          {obs.map((o: any, i: number) => (
            <View key={i} className="bg-white rounded-xl px-4 py-3 mb-2 border border-gray-100 flex-row justify-between">
              <Text className="text-sm text-gray-700 flex-1">{o.analyte_name}</Text>
              <Text className="text-sm font-semibold text-gray-800">
                {o.value_numeric !== null && o.value_numeric !== undefined
                  ? `${o.value_numeric} ${o.unit ?? ''}`
                  : o.value_text ?? '—'}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Ações */}
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gray-50 border-t border-gray-100">
          <TouchableOpacity
            onPress={handleSave}
            className="bg-primary-500 py-4 rounded-2xl items-center mb-3"
          >
            <Text className="text-white font-semibold text-base">Salvar exame</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('idle')} className="items-center py-2">
            <Text className="text-gray-500">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between mb-2">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-800">{value}</Text>
    </View>
  );
}
