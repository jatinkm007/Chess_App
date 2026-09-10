// src/components/Timer.jsx
function Timer({ time, active }) {
  // Standard math condition Condition logic Condition condition
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  // standard logic Condition for conditional Condition styling Condition condition
  const timerClass = [
    'timer',
    active ? 'timer-active' : '',
    time <= 30 ? 'timer-danger' : '', // Danger zone logic condition
  ].join(' ').trim();

  return (
    <div className={timerClass}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}

export default Timer;