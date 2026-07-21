import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface HackerSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function HackerSelect({ label, value, options, onChange, placeholder }: HackerSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity style={styles.selectorBtn} onPress={() => setModalVisible(true)}>
        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {value || placeholder || 'Select option...'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={Colors.dark.primary} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>[ SELECT {label.toUpperCase()} ]</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.optionBtn, value === item && styles.optionBtnSelected]}
                  onPress={() => {
                    onChange(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, value === item && styles.optionTextSelected]}>
                    {value === item ? `> ${item}` : item}
                  </Text>
                  {value === item && (
                    <Ionicons name="checkmark-sharp" size={20} color={Colors.dark.background} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    color: Colors.dark.primary,
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    marginBottom: 5,
  },
  selectorBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#333',
    padding: 15,
    borderRadius: 8,
  },
  valueText: {
    color: Colors.dark.primary,
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
  },
  placeholderText: {
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: Colors.dark.primary,
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
  },
  optionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    borderRadius: 8,
  },
  optionBtnSelected: {
    backgroundColor: Colors.dark.primary,
  },
  optionText: {
    color: Colors.dark.text,
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
  },
  optionTextSelected: {
    color: Colors.dark.background,
    fontWeight: 'bold',
  }
});
