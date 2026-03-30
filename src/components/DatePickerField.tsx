import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';

interface Props {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

function toLocalISO(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDisplay(d: Date): string {
  return `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function DatePickerField({ label, value, onChange }: Props) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value);
  const [mode, setMode] = useState<'date' | 'time'>('date');

  // ─── Web: HTML datetime-local input ───
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.trigger}>
          <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.35)" />
          {/* @ts-ignore — HTML input for web testing */}
          <input
            type="datetime-local"
            value={toLocalISO(value)}
            onChange={(e: any) => {
              const d = new Date(e.target.value);
              if (!isNaN(d.getTime())) onChange(d);
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: 15,
              fontFamily: 'inherit',
              colorScheme: 'dark',
            }}
          />
        </View>
      </View>
    );
  }

  // ─── Mobile: native picker in styled modal ───
  const DateTimePicker = require('@react-native-community/datetimepicker').default;

  function openPicker() {
    setTempDate(value);
    setMode('date');
    setShow(true);
  }

  function handleConfirm() {
    onChange(tempDate);
    setShow(false);
  }

  function handleCancel() {
    setTempDate(value);
    setShow(false);
  }

  // Android: system dialog, no custom modal needed
  function handleAndroidChange(_event: any, selectedDate?: Date) {
    setShow(false);
    if (selectedDate) {
      if (mode === 'date') {
        onChange(selectedDate);
        setTimeout(() => {
          setMode('time');
          setShow(true);
        }, 100);
      } else {
        onChange(selectedDate);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.trigger} onPress={openPicker} activeOpacity={0.7}>
        <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.35)" />
        <Text style={styles.triggerText}>{formatDisplay(value)}</Text>
        <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.25)" />
      </TouchableOpacity>

      {/* iOS: bottom sheet modal */}
      {Platform.OS === 'ios' && (
        <Modal visible={show} transparent animationType="slide">
          <Pressable style={styles.backdrop} onPress={handleCancel} />
          <View style={styles.sheet}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>{label}</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmBtn}
                >
                  <Text style={styles.confirmText}>Confirmer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Picker */}
            <View style={styles.pickerWrap}>
              <DateTimePicker
                value={tempDate}
                mode="datetime"
                display="spinner"
                onChange={(_e: any, d?: Date) => { if (d) setTempDate(d); }}
                themeVariant="dark"
                textColor="#FFFFFF"
                locale="fr-FR"
                style={{ height: 200 }}
              />
            </View>

            {/* Preview */}
            <View style={styles.previewRow}>
              <Ionicons name="time-outline" size={16} color="#667EEA" />
              <Text style={styles.previewText}>{formatDisplay(tempDate)}</Text>
            </View>
          </View>
        </Modal>
      )}

      {/* Android: native dialog (already dark-themed by system) */}
      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          onChange={handleAndroidChange}
          themeVariant="dark"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 18 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  // Trigger button
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 10,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#1A1744',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  // Header
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // Picker
  pickerWrap: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  // Preview
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    paddingVertical: 12,
    marginHorizontal: 20,
    backgroundColor: 'rgba(102,126,234,0.1)',
    borderRadius: 12,
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
