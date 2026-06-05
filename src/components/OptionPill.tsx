import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface Props {
  label: string;
  sublabel?: string;
  selected?: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}

export default function OptionPill({ label, sublabel, selected, onPress, icon }: Props) {
  return (
    <TouchableOpacity
      style={[styles.pill, selected && styles.pillSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <View style={styles.textWrap}>
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        {sublabel ? (
          <Text style={[styles.sublabel, selected && styles.sublabelSelected]}>{sublabel}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  pillSelected: { backgroundColor: '#000' },
  iconWrap: { marginRight: 14 },
  textWrap: { flex: 1 },
  label: { fontSize: 16, fontWeight: '500', color: '#000' },
  labelSelected: { color: '#fff' },
  sublabel: { fontSize: 13, color: '#888', marginTop: 2 },
  sublabelSelected: { color: '#ccc' },
});
