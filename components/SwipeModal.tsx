import React, { useRef, useEffect, useCallback } from 'react';
import {
  View, Modal, StyleSheet, Animated, PanResponder, Dimensions,
  TouchableWithoutFeedback, Keyboard, Platform, KeyboardAvoidingView,
  ScrollView, Text, TouchableOpacity,
} from 'react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SwipeModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeightPercent?: number;
}

export default function SwipeModal({ visible, onClose, children, maxHeightPercent = 90 }: SwipeModalProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  // Use a ref so PanResponder always reads the current value (no stale closure)
  const keyboardVisibleRef = useRef(false);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 200,
      }).start();
    } else {
      translateY.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => { keyboardVisibleRef.current = true; }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => { keyboardVisibleRef.current = false; }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const closeModal = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [onClose]);

  // PanResponder ONLY on the drag handle area — not the entire sheet
  const handlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => {
        // Only capture downward swipes on the handle
        return gs.dy > 5 && Math.abs(gs.dy) > Math.abs(gs.dx);
      },
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) {
          translateY.setValue(gs.dy);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 80 || gs.vy > 0.5) {
          // Dismiss keyboard first, then close
          Keyboard.dismiss();
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 25,
            stiffness: 200,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={closeModal}>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kavContainer}
          keyboardVerticalOffset={0}
        >
          <Animated.View
            style={[
              styles.sheet,
              { maxHeight: `${maxHeightPercent}%` },
              { transform: [{ translateY }] },
            ]}
          >
            {/* Drag handle — PanResponder ONLY here */}
            <View style={styles.handleContainer} {...handlePanResponder.panHandlers}>
              <View style={styles.handle} />
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.scrollContent}
            >
              {children}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/** A "Tamam" toolbar to dismiss keyboard for numeric inputs */
export function NumericDoneBar() {
  return (
    <View style={styles.doneBar}>
      <View style={{ flex: 1 }} />
      <TouchableOpacity onPress={Keyboard.dismiss} style={styles.doneBtn} activeOpacity={0.7}>
        <Text style={styles.doneText}>Tamam</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  kavContainer: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.xxl,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    // Larger touch target for swiping
    minHeight: 28,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  doneBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  doneBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.neonPurple + '25',
  },
  doneText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neonPurple,
  },
});
