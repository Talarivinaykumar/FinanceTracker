import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated as RNAnimated, Easing, LayoutAnimation, PanResponder, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, BellRing, CheckCircle, Info } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearNotifications, removeNotification, AppNotification } from '../store/financeSlice';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Helper to format ISO to relative time
const formatRelativeTime = (isoString: string) => {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

interface SwipeableProps {
  notif: AppNotification;
  onDismiss: () => void;
  fadeAnim: RNAnimated.Value;
  slideAnim: RNAnimated.Value;
}

const SwipeableNotification = ({ notif, onDismiss, fadeAnim, slideAnim }: SwipeableProps) => {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const pan = useRef(new RNAnimated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow swiping right
        if (gestureState.dx > 0) {
          pan.setValue({ x: gestureState.dx, y: 0 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SCREEN_WIDTH * 0.4) {
          // Swipe far enough, animate off screen and dismiss
          RNAnimated.timing(pan, {
            toValue: { x: SCREEN_WIDTH, y: 0 },
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onDismiss();
          });
        } else {
          // Snap back
          RNAnimated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const getIcon = (type: string) => {
    switch(type) {
      case 'reminder': return <BellRing color={theme.gold} size={20} />;
      case 'success': return <CheckCircle color={theme.success} size={20} />;
      case 'info': return <Info color={theme.primary} size={20} />;
      default: return <BellRing color={theme.primary} size={20} />;
    }
  };

  const getIconBackground = (type: string) => {
    switch(type) {
      case 'reminder': return theme.warningBackground;
      case 'success': return theme.successBackground;
      case 'info': return theme.skeletonBackground;
      default: return theme.skeletonBackground;
    }
  };

  const cardOpacity = pan.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.swipeContainer}>
      <RNAnimated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            opacity: RNAnimated.multiply(fadeAnim || new RNAnimated.Value(1), cardOpacity),
            transform: [
              { translateY: slideAnim || 0 },
              { translateX: pan.x }
            ]
          }
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: getIconBackground(notif.type) }]}>
          {getIcon(notif.type)}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{notif.title}</Text>
          <Text style={styles.cardMessage}>{notif.message}</Text>
          <Text style={styles.cardTime}>{formatRelativeTime(notif.time)}</Text>
        </View>
      </RNAnimated.View>
    </View>
  );
};

export const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const rawNotifications = useAppSelector(state => state.finance.notifications);
  
  // Only play animation on mount for the items we have
  const fadeAnims = useRef(rawNotifications.map(() => new RNAnimated.Value(0))).current;
  const slideAnims = useRef(rawNotifications.map(() => new RNAnimated.Value(20))).current;

  useEffect(() => {
    if (rawNotifications.length === 0) return;
    const animations = rawNotifications.map((_, i) =>
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnims[i], {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        RNAnimated.timing(slideAnims[i], {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        })
      ])
    );

    RNAnimated.stagger(100, animations).start();
  }, [fadeAnims, slideAnims]);

  const handleRemove = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(removeNotification(id));
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {rawNotifications.length > 0 ? (
          <TouchableOpacity onPress={() => dispatch(clearNotifications())}>
            <Text style={{ color: theme.primary, fontWeight: '600' }}>Clear All</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {rawNotifications.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <BellRing color={theme.textTertiary} size={48} />
            <Text style={{ color: theme.textSecondary, fontSize: 16, marginTop: 16, fontWeight: '600' }}>No Reminders</Text>
            <Text style={{ color: theme.textTertiary, fontSize: 13, marginTop: 8 }}>You're all caught up!</Text>
          </View>
        )}
        
        {rawNotifications.map((notif, index) => (
          <SwipeableNotification
            key={notif.id}
            notif={notif}
            onDismiss={() => handleRemove(notif.id)}
            fadeAnim={fadeAnims[index]}
            slideAnim={slideAnims[index]}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backBtn: {
    width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18, fontWeight: '700', color: theme.text, fontFamily: 'serif'
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  swipeContainer: {
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardTime: {
    fontSize: 11,
    color: theme.textTertiary,
    fontWeight: '500',
  }
});
