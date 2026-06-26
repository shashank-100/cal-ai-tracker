import { useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ViewToken } from 'react-native';

interface Props {
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
  itemHeight: number;
  visibleItems?: number;
  flex?: number;
}

export default function ScrollPicker({ items, selected, onSelect, itemHeight, visibleItems = 5, flex }: Props) {
  const pickerHeight = itemHeight * visibleItems;
  const initialIndex = items.indexOf(selected);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const mid = viewableItems[Math.floor(viewableItems.length / 2)];
    if (mid?.item) onSelect(mid.item);
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  return (
    <View style={[{ height: pickerHeight }, flex !== undefined && { flex }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
        getItemLayout={(_, index) => ({ length: itemHeight, offset: itemHeight * index, index })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={{ paddingVertical: itemHeight * 2 }}
        renderItem={({ item }) => (
          <View style={[styles.row, { height: itemHeight }]}>
            <Text style={[styles.item, item === selected && styles.itemSelected]}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { justifyContent: 'center', alignItems: 'center' },
  item: { fontSize: 15, color: '#ccc', textAlign: 'center' },
  itemSelected: { fontSize: 17, color: '#000', fontWeight: '600' },
});
