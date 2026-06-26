import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export type TabKey = 'home' | 'progress' | 'groups' | 'profile';

/** App screen names the tab bar can navigate to. */
export type NavTarget = 'home' | 'progress' | 'settings';

interface Props {
  active: TabKey;
  onSelect: (tab: TabKey) => void;
  onAdd: () => void;
  /** Initials shown in the Profile avatar, e.g. "ST". */
  initials?: string;
}

/** Up-to-2-letter initials for the Profile avatar, from name or email. */
export function profileInitials(name?: string | null, email?: string | null): string {
  const source = (name ?? '').trim() || (email ?? '').split('@')[0] || '';
  if (!source) return 'ME';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

/**
 * Shared tab→screen mapping so every screen routes tabs identically.
 * `groups` has no screen yet, so it shows a placeholder instead of navigating.
 */
export function makeTabHandler(navigate: (target: NavTarget) => void) {
  return (tab: TabKey) => {
    if (tab === 'home') navigate('home');
    else if (tab === 'progress') navigate('progress');
    else if (tab === 'profile') navigate('settings');
    else Alert.alert('Coming soon', 'Groups will be available in a future update.');
  };
}

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V9.5"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProgressIcon({ color }: { color: string }) {
  // Three ascending rounded bars (matches the "oOO" chart glyph).
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={13} width={4.5} height={8} rx={2} stroke={color} strokeWidth={2} />
      <Rect x={9.75} y={8} width={4.5} height={13} rx={2} stroke={color} strokeWidth={2} />
      <Rect x={16.5} y={3} width={4.5} height={18} rx={2} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

function GroupsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3} stroke={color} strokeWidth={2} />
      <Circle cx={17} cy={9} r={2.2} stroke={color} strokeWidth={2} />
      <Path
        d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M15 14.5c2.5.2 4.5 2 4.5 4.5"
        stroke={color} strokeWidth={2} strokeLinecap="round"
      />
    </Svg>
  );
}

export default function FloatingTabBar({ active, onSelect, onAdd, initials = 'ME' }: Props) {
  const insets = useSafeAreaInsets();

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'home', label: 'Home' },
    { key: 'progress', label: 'Progress' },
    { key: 'groups', label: 'Groups' },
    { key: 'profile', label: 'Profile' },
  ];

  const iconColor = (k: TabKey) => (active === k ? '#000' : '#9A9A9A');

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.pill}>
        {tabs.map((t) => {
          const isActive = active === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={styles.tab}
              onPress={() => onSelect(t.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, isActive && t.key !== 'profile' && styles.iconWrapActive]}>
                {t.key === 'home' && <HomeIcon color={iconColor(t.key)} />}
                {t.key === 'progress' && <ProgressIcon color={iconColor(t.key)} />}
                {t.key === 'groups' && <GroupsIcon color={iconColor(t.key)} />}
                {t.key === 'profile' && (
                  <View style={[styles.avatar, isActive && styles.avatarActive]}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.fab} onPress={onAdd} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 36,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  tab: { alignItems: 'center', flex: 1, gap: 3 },
  iconWrap: {
    width: 44, height: 32,
    borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: '#F0F0F0' },
  label: { fontSize: 11, color: '#9A9A9A', fontWeight: '500' },
  labelActive: { color: '#000', fontWeight: '700' },
  avatar: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#5EC8D8',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarActive: { borderWidth: 2, borderColor: '#000' },
  avatarText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  fab: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '300', lineHeight: 36 },
});
