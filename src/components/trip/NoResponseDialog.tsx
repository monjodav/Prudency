import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledIcon, scaledFontSize, ms } from '@/src/utils/scaling';

const COUNTDOWN_SECONDS = 2 * 60;

interface NoResponseDialogProps {
  visible: boolean;
  onAllGood: () => void;
  onTriggerAlert: () => void;
  onAutoAlert: () => void;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function NoResponseDialog({
  visible,
  onAllGood,
  onTriggerAlert,
  onAutoAlert,
}: NoResponseDialogProps) {
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoAlertCalledRef = useRef(false);

  const clearCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      clearCountdown();
      setRemaining(COUNTDOWN_SECONDS);
      autoAlertCalledRef.current = false;
      return;
    }

    autoAlertCalledRef.current = false;
    setRemaining(COUNTDOWN_SECONDS);

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearCountdown;
  }, [visible, clearCountdown]);

  useEffect(() => {
    if (remaining === 0 && visible && !autoAlertCalledRef.current) {
      autoAlertCalledRef.current = true;
      onAutoAlert();
    }
  }, [remaining, visible, onAutoAlert]);

  const progress = remaining / COUNTDOWN_SECONDS;
  const isUrgent = remaining <= 60;

  return (
    <Modal visible={visible} onClose={onAllGood} title="Es-tu en securite ?">
      <View style={styles.content}>
        <View style={styles.iconRow}>
          <Ionicons
            name="alert-circle"
            size={scaledIcon(48)}
            color={isUrgent ? colors.error[500] : colors.warning[500]}
          />
        </View>

        <Text style={styles.message}>
          Aucune reponse depuis un moment. Si tu ne reponds pas, une alerte sera
          envoyee automatiquement a tes contacts de confiance.
        </Text>

        <View style={styles.timerContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: isUrgent
                    ? colors.error[500]
                    : colors.warning[500],
                },
              ]}
            />
          </View>
          <Text style={[styles.timerText, isUrgent && styles.timerTextUrgent]}>
            {formatTime(remaining)}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Tout va bien"
            variant="outline"
            onPress={onAllGood}
            style={styles.allGoodButton}
          />
          <Button
            title="Declencher une alerte maintenant"
            onPress={onTriggerAlert}
            style={styles.alertButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  iconRow: {
    marginBottom: spacing[4],
  },
  message: {
    ...typography.bodySmall,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: ms(20, 0.4),
  },
  timerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing[6],
    gap: spacing[3],
  },
  progressBarBackground: {
    width: '100%',
    height: ms(6, 0.5),
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  timerText: {
    fontSize: scaledFontSize(32),
    fontWeight: '700',
    color: colors.warning[600],
    fontVariant: ['tabular-nums'],
  },
  timerTextUrgent: {
    color: colors.error[500],
  },
  actions: {
    width: '100%',
    gap: spacing[3],
  },
  allGoodButton: {
    width: '100%',
  },
  alertButton: {
    width: '100%',
    backgroundColor: colors.error[500],
  },
});
