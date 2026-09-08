export function triggerHapticFeedback(type: 'sent' | 'incoming', enabled: boolean = true) {
  if (!enabled || typeof navigator === 'undefined' || !navigator.vibrate) {
    return;
  }

  try {
    if (type === 'sent') {
      // Light, short tap for sending
      navigator.vibrate(40);
    } else if (type === 'incoming') {
      // Distinct double pulse for incoming message
      navigator.vibrate([80, 60, 100]);
    }
  } catch (err) {
    // Ignore, some browsers might block this if not triggered by user interaction (though vibrate usually works for incoming if the page is active)
    console.debug('Haptic feedback failed:', err);
  }
}
